import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Chatbot } from './components/chatbot/chatbot';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}