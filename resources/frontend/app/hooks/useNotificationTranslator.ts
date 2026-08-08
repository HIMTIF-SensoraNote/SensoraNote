import { useTranslation } from "./useTranslation";

/**
 * Sanitize LaTeX math expressions for plain-text notification contexts.
 *
 * All four common LaTeX notation styles are converted to a readable fallback:
 *   $$...$$ → [Rumus: ...]
 *   \[...\] → [Rumus: ...]
 *   \(...\) → [Rumus: ...]
 *   $...$   → [Rumus: ...]
 *
 * Mirrors NotificationTranslator::sanitizeLatex() on the PHP backend.
 */
function sanitizeLatex(text: string): string {
  if (!text) return text;

  // Display math: $$...$$
  text = text.replace(/\$\$(.+?)\$\$/gs, (_, inner) => `[Rumus: ${inner.trim()}]`);

  // Display math: \[...\]
  text = text.replace(/\\\[(.+?)\\\]/gs, (_, inner) => `[Rumus: ${inner.trim()}]`);

  // Inline math: \(...\)
  text = text.replace(/\\\((.+?)\\\)/gs, (_, inner) => `[Rumus: ${inner.trim()}]`);

  // Inline math: $...$ (must be last to avoid double-processing $$)
  text = text.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/gs, (_, inner) => `[Rumus: ${inner.trim()}]`);

  return text;
}

export function useNotificationTranslator() {
  const { t } = useTranslation();

  const translateNotification = (notification: any) => {
    let title = sanitizeLatex(notification.title || "");
    let message = sanitizeLatex(notification.message || "");

    // --- LIKES ---
    if (title === "Ada yang menyukai Catatan Anda!") title = t("notif.like_note_title");
    if (title === "Seseorang Menyukai Catatanmu") title = t("notif.like_note_title_alt");
    if (title === "Ada yang menyukai Komentar Anda!") title = t("notif.like_comment_title");
    
    const likeNoteMatch = message.match(/^(.*?) menyukai catatanmu "(.*)"\.$/);
    if (likeNoteMatch) {
      message = t("notif.like_note_msg", { name: likeNoteMatch[1], note: likeNoteMatch[2] });
    }
    const likeCommentMatch = message.match(/^(.*?) menyukai komentarmu\.$/);
    if (likeCommentMatch) {
      message = t("notif.like_comment_msg", { name: likeCommentMatch[1] });
    }

    // --- COMMENTS & RESPONDS ---
    if (title === "Seseorang membalas komentarmu") title = t("notif.reply_title");
    if (title === "Komentar Baru di Catatanmu") title = t("notif.comment_title");
    if (title === "Respons Baru di Catatanmu") title = t("notif.respond_title");
    
    const replyMatch = message.match(/^(.*?) membalas: "(.*)"$/);
    if (replyMatch) {
      message = t("notif.reply_msg", { name: replyMatch[1], content: replyMatch[2] });
    }
    const commentMatch = message.match(/^(.*?) berkomentar: "(.*)"$/);
    if (commentMatch) {
      message = t("notif.comment_msg", { name: commentMatch[1], content: commentMatch[2] });
    }
    const respondMatch = message.match(/^(.*?) merespons catatan anda$/);
    if (respondMatch) {
      message = t("notif.respond_msg", { name: respondMatch[1] });
    }

    // --- POST REVIEW ---
    if (title === "Catatan Perlu Perbaikan") title = t("notif.post_needs_work_title");
    if (title.includes("Catatan Disetujui Pakar")) title = t("notif.post_approved_title");
    
    const needsWorkMatch = message.match(/^Catatanmu "(.*?)" memerlukan perbaikan berdasarkan tinjauan pakar\.$/);
    if (needsWorkMatch) {
      message = t("notif.post_needs_work_msg", { title: needsWorkMatch[1] });
    }
    const approvedMatch = message.match(/^Selamat! Catatan "(.*?)" telah diverifikasi\. Rating: (.*?) Bintang\. Pesan: "(.*?)"$/);
    if (approvedMatch) {
      message = t("notif.post_approved_msg", { title: approvedMatch[1], rating: approvedMatch[2], feedback: approvedMatch[3] });
    }

    // --- FOLLOWS ---
    if (title === "Pengikut Baru") title = t("notif.follow_new_title");
    if (title === "Permintaan Mengikuti") title = t("notif.follow_req_title");
    if (title === "Permintaan Diterima") title = t("notif.follow_acc_title");

    const followMatch = message.match(/^(.*?) mulai mengikuti anda\.$/);
    if (followMatch) {
      message = t("notif.follow_new_msg", { username: followMatch[1] });
    }
    const followReqMatch = message.match(/^(.*?) ingin mengikuti anda\.$/);
    if (followReqMatch) {
      message = t("notif.follow_req_msg", { username: followReqMatch[1] });
    }
    const followAccMatch = message.match(/^(.*?) menerima permintaan mengikuti anda\.$/);
    if (followAccMatch) {
      message = t("notif.follow_acc_msg", { username: followAccMatch[1] });
    }

    // --- SYSTEM / VERIFIKASI ---
    if (title === "Sertifikasi Diterima!") title = t("notif.cert_acc_title");
    if (title === "Sertifikasi Ditolak") title = t("notif.cert_rej_title");
    if (title === "Pengajuan Pakar Baru") title = t("notif.cert_new_title");

    const certNewMatch = message.match(/^(.*?) mengajukan diri sebagai pakar di bidang (.*?)\.$/);
    if (certNewMatch) {
      message = t("notif.cert_new_msg", { name: certNewMatch[1], field: certNewMatch[2] });
    }
    const certAccMatch2 = message.match(/^Selamat! Pengajuan sertifikasi pakarmu untuk bidang (.*?) telah disetujui Admin\.$/);
    if (certAccMatch2) {
      message = t("notif.cert_acc_msg_2", { field: certAccMatch2[1] });
    }
    const certRejMatch2 = message.match(/^Mohon maaf, pengajuan sertifikasi pakarmu untuk bidang (.*?) belum dapat disetujui saat ini\.$/);
    if (certRejMatch2) {
      message = t("notif.cert_rej_msg_2", { field: certRejMatch2[1] });
    }

    // --- REPORTS ---
    if (title.includes("Laporan Diterima") || title.includes("Laporan Komentar Diterima") || title.includes("Laporan Pengguna Diterima")) title = t("notif.report_recv_title");
    if (title.includes("Peringatan: Catatan Dilaporkan")) title = t("notif.report_warn_note_title");
    if (title.includes("Peringatan: Komentar Dilaporkan")) title = t("notif.report_warn_comment_title");
    if (title.includes("Catatan Dihapus")) title = t("notif.report_del_note_title");
    if (title.includes("Komentar Dihapus")) title = t("notif.report_del_comment_title");
    if (title.includes("Akun Diblokir")) title = t("notif.report_banned_title");
    if (title.includes("Laporan Ditolak")) title = t("notif.report_rejected_title");
    
    const delNoteMatch = message.match(/^Catatan kamu "(.*?)" telah dihapus oleh Admin karena melanggar panduan komunitas kami\. Alasan admin: (.*)$/);
    if (delNoteMatch) {
      message = t("notif.report_del_note_msg", { title: delNoteMatch[1], reason: delNoteMatch[2] });
    }
    const delCommentMatch = message.match(/^Komentar kamu telah dihapus oleh Admin karena melanggar panduan komunitas kami\. Alasan admin: (.*)$/);
    if (delCommentMatch) {
      message = t("notif.report_del_comment_msg", { reason: delCommentMatch[1] });
    }
    const warnNoteMatch = message.match(/^Catatan kamu "(.*?)" dilaporkan karena: (.*?)\. Tim pakar\/admin akan mereviewnya\.$/);
    if (warnNoteMatch) {
      message = t("notif.report_warn_note_msg", { title: warnNoteMatch[1], reason: warnNoteMatch[2] });
    }
    const recvNoteMatch = message.match(/^Laporan kamu untuk catatan "(.*?)" sedang direview oleh tim kami\.$/);
    if (recvNoteMatch) {
      message = t("notif.report_recv_note_msg", { title: recvNoteMatch[1] });
    }
    const recvUserMatch = message.match(/^Laporan kamu untuk pengguna @(.*?) sedang direview oleh admin\.$/);
    if (recvUserMatch) {
      message = t("notif.report_recv_user_msg", { username: recvUserMatch[1] });
    }
    const rejMatch = message.match(/^Laporan kamu ditolak oleh admin dengan alasan: (.*)$/);
    if (rejMatch) {
      message = t("notif.report_rej_msg", { reason: rejMatch[1] });
    }
    
    return { ...notification, translatedTitle: title, translatedMessage: message };
  };

  return { translateNotification };
}
