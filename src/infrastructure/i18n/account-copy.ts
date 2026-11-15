import type { Locale } from "@/domain/models/i18n";
import type { SyncIssue } from "@/infrastructure/sync/sync-meta-store";

type AccountCopy = {
  title: string;
  intro: string;
  privacyTitle: string;
  privacy: string[];
  email: string;
  ageLegend: string;
  age14: string;
  ageGuardian: string;
  consent: string;
  send: string;
  sending: string;
  sent: (email: string) => string;
  signedInAs: (email: string) => string;
  lastSync: (when: string) => string;
  neverSynced: string;
  syncNow: string;
  syncing: string;
  synced: (pulled: number, pushed: number, merged: number) => string;
  drafts: string;
  draftsHint: string;
  draftsRemoved: string;
  export: string;
  exported: string;
  signOut: string;
  signedOut: string;
  deleteTitle: string;
  deleteHint: string;
  deleteLabel: string;
  deleteButton: string;
  deleted: string;
  issues: Record<SyncIssue | "invalid-email" | "rate-limited" | "mail-unavailable" | "confirmation-mismatch" | "unknown", string>;
  verify: {
    title: string;
    intro: string;
    confirm: string;
    confirming: string;
    missing: string;
    invalid: string;
    done: string;
    back: string;
  };
};

export const accountCopy: Record<Locale, AccountCopy> = {
  es: {
    title: "Cuenta y sincronización",
    intro: "Opcional. LearnV funciona igual sin cuenta. Con ella, tu progreso se copia entre el móvil y el ordenador.",
    privacyTitle: "Qué se guarda en el servidor",
    privacy: [
      "Tu correo y la fecha en que aceptaste estas condiciones. Nada más sobre ti.",
      "Una copia cifrada de tu progreso: etapas, repasos, tablero, perfil de solicitante y diario de estudio.",
      "Tus textos libres (redacciones y respuestas de entrevista) solo si activas «Sincronizar borradores».",
      "Nunca se suben documentos ni archivos.",
      "Puedes descargar o borrar la cuenta cuando quieras. Las cuentas sin uso durante 2 años se borran solas.",
    ],
    email: "Correo electrónico",
    ageLegend: "Edad",
    age14: "Tengo 14 años o más.",
    ageGuardian: "Tengo menos de 14 años y mi madre, padre o tutor legal da su consentimiento.",
    consent: "He leído qué se guarda y acepto que se trate para sincronizar mi progreso.",
    send: "Enviar enlace de acceso",
    sending: "Enviando…",
    sent: (email) => `Si ${email} es correcto, te llegará un enlace en unos minutos. Caduca en 15 minutos. Revisa también el spam.`,
    signedInAs: (email) => `Sesión iniciada como ${email}`,
    lastSync: (when) => `Última sincronización: ${when}`,
    neverSynced: "Aún no se ha sincronizado.",
    syncNow: "Sincronizar ahora",
    syncing: "Sincronizando…",
    synced: (pulled, pushed, merged) => `Sincronizado. Recibidos: ${pulled}. Enviados: ${pushed}. Combinados: ${merged}.`,
    drafts: "Sincronizar borradores (textos libres)",
    draftsHint: "Desactivado, tus redacciones y respuestas solo están en este dispositivo. Al desactivarlo se borra la copia del servidor.",
    draftsRemoved: "Borradores eliminados del servidor. Siguen en este dispositivo.",
    export: "Descargar mis datos del servidor",
    exported: "Descargado. Puedes restaurarlo en cualquier dispositivo desde «Copia de seguridad».",
    signOut: "Cerrar sesión",
    signedOut: "Sesión cerrada. Tus datos siguen en este dispositivo.",
    deleteTitle: "Borrar la cuenta",
    deleteHint: "Borra para siempre la cuenta y todas las copias del servidor. Lo guardado en este dispositivo no se toca.",
    deleteLabel: "Escribe tu correo para confirmar",
    deleteButton: "Borrar cuenta para siempre",
    deleted: "Cuenta borrada. Tus datos siguen en este dispositivo.",
    issues: {
      offline: "Sin conexión. Se sincronizará cuando vuelva la red.",
      "signed-out": "La sesión ha caducado. Pide un enlace nuevo para seguir sincronizando.",
      quota: "Has llegado al límite de 5 MB de la cuenta. Algunas partes no se han subido.",
      server: "El servidor no ha respondido bien. Se volverá a intentar.",
      conflict: "Otro dispositivo estaba sincronizando a la vez. Se volverá a intentar.",
      "invalid-email": "Revisa el correo: no parece válido.",
      "rate-limited": "Demasiados intentos. Espera unos minutos.",
      "mail-unavailable": "No se ha podido enviar el correo ahora. Inténtalo más tarde.",
      "confirmation-mismatch": "El correo no coincide con el de la cuenta.",
      unknown: "Algo ha fallado. Inténtalo de nuevo.",
    },
    verify: {
      title: "Entrar en LearnV",
      intro: "Confirma que quieres entrar con este enlace en este navegador.",
      confirm: "Confirmar y entrar",
      confirming: "Entrando…",
      missing: "Este enlace no está completo. Pide uno nuevo desde Perfil.",
      invalid: "El enlace ha caducado o ya se usó. Pide uno nuevo desde Perfil.",
      done: "Sesión iniciada. Sincronizando tu progreso…",
      back: "Ir a Perfil",
    },
  },
  en: {
    title: "Account and sync",
    intro: "Optional. LearnV works the same without an account. With one, your progress is copied between your phone and computer.",
    privacyTitle: "What the server keeps",
    privacy: [
      "Your email address and when you accepted these terms. Nothing else about you.",
      "An encrypted copy of your progress: stages, reviews, board, applicant profile and study journal.",
      "Your free texts (essays and interview answers) only if you turn on “Sync drafts”.",
      "Documents and files are never uploaded.",
      "You can download or delete the account at any time. Accounts unused for 2 years are deleted automatically.",
    ],
    email: "Email address",
    ageLegend: "Age",
    age14: "I am 14 or older.",
    ageGuardian: "I am under 14 and my parent or legal guardian consents.",
    consent: "I have read what is kept and agree to it being processed to sync my progress.",
    send: "Send sign-in link",
    sending: "Sending…",
    sent: (email) => `If ${email} is correct, a link will arrive in a few minutes. It expires in 15 minutes. Check spam too.`,
    signedInAs: (email) => `Signed in as ${email}`,
    lastSync: (when) => `Last sync: ${when}`,
    neverSynced: "Not synced yet.",
    syncNow: "Sync now",
    syncing: "Syncing…",
    synced: (pulled, pushed, merged) => `Synced. Received: ${pulled}. Sent: ${pushed}. Merged: ${merged}.`,
    drafts: "Sync drafts (free texts)",
    draftsHint: "When off, your essays and answers stay on this device only. Turning it off deletes the server copy.",
    draftsRemoved: "Drafts deleted from the server. They are still on this device.",
    export: "Download my server data",
    exported: "Downloaded. You can restore it on any device from “Backup”.",
    signOut: "Sign out",
    signedOut: "Signed out. Your data is still on this device.",
    deleteTitle: "Delete the account",
    deleteHint: "Permanently deletes the account and every server copy. Data saved on this device is not touched.",
    deleteLabel: "Type your email address to confirm",
    deleteButton: "Delete account permanently",
    deleted: "Account deleted. Your data is still on this device.",
    issues: {
      offline: "Offline. Sync resumes when you are back online.",
      "signed-out": "Your session expired. Ask for a new link to keep syncing.",
      quota: "The account reached its 5 MB limit. Some parts were not uploaded.",
      server: "The server did not respond properly. It will try again.",
      conflict: "Another device was syncing at the same time. It will try again.",
      "invalid-email": "Check the email address: it does not look valid.",
      "rate-limited": "Too many attempts. Wait a few minutes.",
      "mail-unavailable": "The email could not be sent right now. Try again later.",
      "confirmation-mismatch": "That is not the account's email address.",
      unknown: "Something went wrong. Try again.",
    },
    verify: {
      title: "Sign in to LearnV",
      intro: "Confirm that you want to sign in with this link in this browser.",
      confirm: "Confirm and sign in",
      confirming: "Signing in…",
      missing: "This link is incomplete. Ask for a new one from Profile.",
      invalid: "The link expired or was already used. Ask for a new one from Profile.",
      done: "Signed in. Syncing your progress…",
      back: "Go to Profile",
    },
  },
  ko: {
    title: "계정과 동기화",
    intro: "선택 사항입니다. 계정이 없어도 LearnV는 똑같이 작동합니다. 계정이 있으면 휴대폰과 컴퓨터 사이에 학습 기록이 복사됩니다.",
    privacyTitle: "서버에 저장되는 정보",
    privacy: [
      "이메일 주소와 이 조건에 동의한 날짜. 그 밖의 개인 정보는 저장하지 않습니다.",
      "암호화된 학습 기록 사본: 단계, 복습, 보드, 지원자 프로필, 학습 일지.",
      "자유 작성 글(에세이, 면접 답변)은 ‘초안 동기화’를 켤 때만 저장됩니다.",
      "서류나 파일은 절대 업로드하지 않습니다.",
      "언제든지 계정을 내려받거나 삭제할 수 있습니다. 2년 동안 사용하지 않은 계정은 자동으로 삭제됩니다.",
    ],
    email: "이메일 주소",
    ageLegend: "나이",
    age14: "만 14세 이상입니다.",
    ageGuardian: "만 14세 미만이며 부모님 또는 법정 대리인이 동의합니다.",
    consent: "저장되는 정보를 읽었으며 학습 기록 동기화를 위한 처리에 동의합니다.",
    send: "로그인 링크 보내기",
    sending: "보내는 중…",
    sent: (email) => `${email} 주소가 맞다면 몇 분 안에 링크가 도착합니다. 링크는 15분 뒤 만료됩니다. 스팸함도 확인하세요.`,
    signedInAs: (email) => `${email}(으)로 로그인됨`,
    lastSync: (when) => `마지막 동기화: ${when}`,
    neverSynced: "아직 동기화하지 않았습니다.",
    syncNow: "지금 동기화",
    syncing: "동기화 중…",
    synced: (pulled, pushed, merged) => `동기화 완료. 받음: ${pulled}. 보냄: ${pushed}. 병합: ${merged}.`,
    drafts: "초안 동기화 (자유 작성 글)",
    draftsHint: "끄면 에세이와 답변은 이 기기에만 남습니다. 끄면 서버 사본이 삭제됩니다.",
    draftsRemoved: "서버에서 초안을 삭제했습니다. 이 기기에는 그대로 있습니다.",
    export: "서버 데이터 내려받기",
    exported: "내려받았습니다. ‘백업’에서 어느 기기에서든 복원할 수 있습니다.",
    signOut: "로그아웃",
    signedOut: "로그아웃했습니다. 데이터는 이 기기에 그대로 있습니다.",
    deleteTitle: "계정 삭제",
    deleteHint: "계정과 모든 서버 사본을 영구 삭제합니다. 이 기기에 저장된 데이터는 그대로 둡니다.",
    deleteLabel: "확인을 위해 이메일 주소를 입력하세요",
    deleteButton: "계정 영구 삭제",
    deleted: "계정을 삭제했습니다. 데이터는 이 기기에 그대로 있습니다.",
    issues: {
      offline: "오프라인입니다. 다시 연결되면 동기화합니다.",
      "signed-out": "세션이 만료되었습니다. 계속 동기화하려면 새 링크를 요청하세요.",
      quota: "계정 용량 5MB에 도달했습니다. 일부는 업로드되지 않았습니다.",
      server: "서버가 제대로 응답하지 않았습니다. 다시 시도합니다.",
      conflict: "다른 기기가 동시에 동기화하고 있었습니다. 다시 시도합니다.",
      "invalid-email": "이메일 주소를 확인하세요. 올바르지 않은 것 같습니다.",
      "rate-limited": "시도가 너무 많습니다. 몇 분 뒤에 다시 시도하세요.",
      "mail-unavailable": "지금은 메일을 보낼 수 없습니다. 나중에 다시 시도하세요.",
      "confirmation-mismatch": "계정의 이메일 주소와 다릅니다.",
      unknown: "문제가 발생했습니다. 다시 시도하세요.",
    },
    verify: {
      title: "LearnV 로그인",
      intro: "이 브라우저에서 이 링크로 로그인할지 확인하세요.",
      confirm: "확인하고 로그인",
      confirming: "로그인 중…",
      missing: "링크가 완전하지 않습니다. 프로필에서 새 링크를 요청하세요.",
      invalid: "링크가 만료되었거나 이미 사용되었습니다. 프로필에서 새 링크를 요청하세요.",
      done: "로그인했습니다. 학습 기록을 동기화하는 중…",
      back: "프로필로 이동",
    },
  },
};
