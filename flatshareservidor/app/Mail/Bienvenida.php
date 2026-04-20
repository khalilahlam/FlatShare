<?php

namespace App\Mail;

use App\Models\Usuario;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class Bienvenida extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Usuario $usuario)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Bienvenido/a a FlatShare, ' . $this->usuario->nombre . '!',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.bienvenida',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}