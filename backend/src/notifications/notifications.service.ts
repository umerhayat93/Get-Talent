import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { PushSubscription } from './push-subscription.entity';
import { User } from '../users/user.entity';

@Injectable()
export class NotificationsService {
  private webpush: any = null;

  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(PushSubscription) private pushRepo: Repository<PushSubscription>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    this.initWebPush();
  }

  private async initWebPush() {
    try {
      const wp = require('web-push');
      const pubKey = process.env.VAPID_PUBLIC_KEY;
      const privKey = process.env.VAPID_PRIVATE_KEY;
      const email = process.env.VAPID_EMAIL || 'mailto:admin@gettalent.pk';
      if (pubKey && privKey) {
        wp.setVapidDetails(email, pubKey, privKey);
        this.webpush = wp;
      }
    } catch (e) {}
  }

  async getVapidPublicKey() {
    return { publicKey: process.env.VAPID_PUBLIC_KEY || '' };
  }

  async subscribe(userId: string, subscription: any) {
    const user = userId ? await this.userRepo.findOne({ where: { id: userId } }) : null;
    const existing = await this.pushRepo.findOne({ where: { endpoint: subscription.endpoint } });
    if (existing) return { ok: true };
    const sub = this.pushRepo.create({
      user,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys?.p256dh || '',
      auth: subscription.keys?.auth || '',
    });
    await this.pushRepo.save(sub);
    return { ok: true };
  }

  async notifyUser(userId: string, title: string, message: string, type = 'general') {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;
    const notif = this.notifRepo.create({ user, title, message, type });
    await this.notifRepo.save(notif);
    await this.sendPush(userId, title, message);
  }

  async broadcast(title: string, message: string, type = 'broadcast') {
    const notif = this.notifRepo.create({ title, message, type, isBroadcast: true });
    await this.notifRepo.save(notif);
    await this.sendPushAll(title, message);
    return { ok: true, message: 'Broadcast sent' };
  }

  async getForUser(userId: string) {
    const personal = await this.notifRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    const broadcasts = await this.notifRepo.find({
      where: { isBroadcast: true },
      order: { createdAt: 'DESC' },
      take: 20,
    });
    const all = [...personal, ...broadcasts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all;
  }

  async markRead(id: string) {
    await this.notifRepo.update(id, { isRead: true });
    return { ok: true };
  }

  async markAllRead(userId: string) {
    await this.notifRepo.update({ user: { id: userId } }, { isRead: true });
    return { ok: true };
  }

  private async sendPush(userId: string, title: string, body: string) {
    if (!this.webpush) return;
    const subs = await this.pushRepo.find({ where: { user: { id: userId } } });
    for (const sub of subs) {
      try {
        await this.webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body, icon: '/icons/icon-192.png' })
        );
      } catch (e) {
        if (e.statusCode === 410) await this.pushRepo.delete(sub.id);
      }
    }
  }

  private async sendPushAll(title: string, body: string) {
    if (!this.webpush) return;
    const subs = await this.pushRepo.find();
    for (const sub of subs) {
      try {
        await this.webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body, icon: '/icons/icon-192.png', badge: '/icons/badge-72.png' })
        );
      } catch (e) {
        if (e.statusCode === 410) await this.pushRepo.delete(sub.id);
      }
    }
  }
}
