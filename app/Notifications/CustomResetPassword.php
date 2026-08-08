<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;

class CustomResetPassword extends ResetPassword
{
    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return MailMessage
     */
    public function toMail($notifiable)
    {
        if (static::$toMailCallback) {
            return call_user_func(static::$toMailCallback, $notifiable, $this->token);
        }

        // URL mengarah ke Laravel (port 8000/8001) pada prefix /app/
        $baseUrl = config('app.url');
        $url = rtrim($baseUrl, '/').'/app/reset-password/'.$this->token.'?email='.urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject(Lang::get('email.subject'))
            ->greeting(Lang::get('email.greeting', ['name' => $notifiable->name]))
            ->line(Lang::get('email.line1'))
            ->action(Lang::get('email.action'), $url)
            ->line(Lang::get('email.warning'))
            ->salutation(Lang::get('email.regards')."\n\n".config('app.name'));
    }
}
