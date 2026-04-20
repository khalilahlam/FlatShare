<?php

namespace App\Mail;

use App\Models\Piso;
use App\Models\Usuario;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SolicitudRechazada extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Piso $piso, public Usuario $inquilino)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '❌ Tu solicitud no ha sido aceptada',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.solicitud-rechazada',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}