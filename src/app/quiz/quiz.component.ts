import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent {
  questions = [
    {
      question: 'What is the scientific name of Tulsi?',
      options: ['Ocimum sanctum', 'Azadirachta indica', 'Withania somnifera', 'Rosa indica'],
      correctAnswer: 'Ocimum sanctum',
      selectedAnswer: ''
    },
    {
      question: 'Which herb is used to treat cough?',
      options: ['Tulsi', 'Mint', 'Coriander', 'Ginger'],
      correctAnswer: 'Tulsi',
      selectedAnswer: ''
    },
    // Add 8 more questions similarly
  ];

  score = 0;
  showResult = false;

  // Calculate score
  calculateScore() {
    this.score = 0;
    this.questions.forEach((q) => {
      if (q.selectedAnswer === q.correctAnswer) {
        this.score++;
      }
    });
    this.showResult = true;
  }

  // Generate certificate
  generateCertificate() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Certificate of Achievement', 60, 40);
    doc.setFontSize(14);
    doc.text('This is to certify that you have successfully completed the quiz', 20, 60);
    doc.text(`Your Score: ${this.score}/10`, 20, 80);
    doc.save('Certificate.pdf');
  }
}
