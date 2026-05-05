<?php

namespace App\Mail;

use App\Models\Piso;
use App\Models\Usuario;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ChatDisponible extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Piso $piso, public Usuario $usuario)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '💬 ¡Ya tienes chat disponible en FlatShare!',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.chat-disponible',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}