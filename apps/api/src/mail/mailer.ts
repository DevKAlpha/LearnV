import type { Config } from "../config.ts";
import { magicLinkMessage, type MailLocale } from "./mail-copy.ts";

export type MagicLinkMail = { to: string; link: string; locale: MailLocale; minutes: number };

export interface Mailer {
  sendMagicLink(mail: MagicLinkMail): Promise<void>;
}

/** Keeps messages in memory (tests read the link from here). */
export class MemoryMailer implements Mailer {
  readonly sent: MagicLinkMail[] = [];
  async sendMagicLink(mail: MagicLinkMail) {
    this.sent.push(mail);
  }
}

/** Development only (refused in production by loadConfig): prints the link instead of sending it. */
class ConsoleMailer implements Mailer {
  async sendMagicLink(mail: MagicLinkMail) {
    console.warn(`[mail] Sign-in link for ${mail.to}: ${mail.link}`);
  }
}

class SmtpMailer implements Mailer {
  private readonly transport: Promise<import("nodemailer").Transporter>;
  private readonly from: string;
  constructor(url: string, from: string) {
    this.from = from;
    this.transport = import("nodemailer").then(({ default: nodemailer }) => nodemailer.createTransport(url));
  }
  async sendMagicLink(mail: MagicLinkMail) {
    const message = magicLinkMessage(mail.locale, mail.link, mail.minutes);
    await (await this.transport).sendMail({ from: this.from, to: mail.to, subject: message.subject, text: message.text, html: message.html });
  }
}

export function createMailer(config: Config["mail"]): Mailer {
  if (config.transport === "smtp") return new SmtpMailer(config.url, config.from);
  if (config.transport === "memory") return new MemoryMailer();
  return new ConsoleMailer();
}
