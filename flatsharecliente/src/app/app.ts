import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Chatbot } from './components/chatbot/chatbot';
import { Footer } from './components/footer/footer';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Chatbot,Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}