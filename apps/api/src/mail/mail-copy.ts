export type MailLocale = "es" | "en" | "ko";

const copy: Record<MailLocale, { subject: string; intro: string; button: string; expiry: (minutes: number) => string; ignore: string }> = {
  es: {
    subject: "Tu enlace para entrar en LearnV",
    intro: "Pulsa el botón para entrar en LearnV y sincronizar tu progreso.",
    button: "Entrar en LearnV",
    expiry: (minutes) => `El enlace caduca en ${minutes} minutos y solo sirve una vez.`,
    ignore: "Si no lo has pedido tú, ignora este correo: sin el enlace nadie puede entrar en tu cuenta.",
  },
  en: {
    subject: "Your LearnV sign-in link",
    intro: "Use the button to sign in to LearnV and sync your progress.",
    button: "Sign in to LearnV",
    expiry: (minutes) => `The link expires in ${minutes} minutes and works only once.`,
    ignore: "If you did not ask for it, ignore this email: nobody can sign in without the link.",
  },
  ko: {
    subject: "LearnV 로그인 링크",
    intro: "아래 버튼을 눌러 LearnV에 로그인하고 학습 기록을 동기화하세요.",
    button: "LearnV 로그인",
    expiry: (minutes) => `이 링크는 ${minutes}분 뒤에 만료되며 한 번만 사용할 수 있습니다.`,
    ignore: "직접 요청하지 않았다면 이 메일을 무시하세요. 링크 없이는 누구도 로그인할 수 없습니다.",
  },
};

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export function magicLinkMessage(locale: MailLocale, link: string, minutes: number) {
  const text = copy[locale];
  const safeLink = escapeHtml(link);
  return {
    subject: text.subject,
    text: `${text.intro}\n\n${link}\n\n${text.expiry(minutes)}\n${text.ignore}\n`,
    html: `<!doctype html><html lang="${locale}"><body style="font-family:sans-serif;line-height:1.5;color:#1d1a24">`
      + `<p>${escapeHtml(text.intro)}</p>`
      + `<p><a href="${safeLink}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#ffd84d;color:#1d1a24;font-weight:700;text-decoration:none">${escapeHtml(text.button)}</a></p>`
      + `<p style="font-size:14px">${escapeHtml(text.expiry(minutes))}<br>${escapeHtml(text.ignore)}</p>`
      + `</body></html>`,
  };
}
