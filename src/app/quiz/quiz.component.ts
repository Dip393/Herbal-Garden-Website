import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent {
  questions = [
    {
      question: 'What does AYUSH stand for?',
      options: [
        'Alternative Yoga for Universal Healing Sciences',
        'Ayurveda, Yoga, Unani, Siddha, and Healing',
        'Ayurveda, Yoga, Unani, Siddha, and Homoeopathy',
        'Ayurvedic Yoga and Unified System of Healing'
      ],
      correctAnswer: 'Ayurveda, Yoga, Unani, Siddha, and Homoeopathy',
      selectedAnswer: ''
    },
    {
      question: 'What is the primary purpose of a herbal garden?',
      options: [
        'Aesthetic beauty',
        'Growing medicinal plants',
        'Growing fruits and vegetables',
        'Recreational activities'
      ],
      correctAnswer: 'Growing medicinal plants',
      selectedAnswer: ''
    },
    {
      question: 'Which plant is commonly known as "Holy Basil"?',
      options: ['Tulsi', 'Neem', 'Mint', 'Curry leaf'],
      correctAnswer: 'Tulsi',
      selectedAnswer: ''
    },
    {
      question: 'Which herb is used for treating skin infections and has antibacterial properties?',
      options: ['Coriander', 'Aloe Vera', 'Basil', 'Tulsi'],
      correctAnswer: 'Aloe Vera',
      selectedAnswer: ''
    },
    {
      question: 'What is the ideal environment for growing herbal plants?',
      options: [
        'Low sunlight and wet soil',
        'Heavy sunlight and water-logged soil',
        'Complete shade and dry soil',
        'Moderate sunlight and well-drained soil'
      ],
      correctAnswer: 'Moderate sunlight and well-drained soil',
      selectedAnswer: ''
    },
    {
      question: 'Ashwagandha is commonly used in herbal medicine for its properties to improve:',
      options: ['Digestion', 'Immunity', 'Stress and anxiety', 'Skin health'],
      correctAnswer: 'Stress and anxiety',
      selectedAnswer: ''
    },
    {
      question: 'Which AYUSH system uses plants like Kalmegh and Mulethi for treatment?',
      options: ['Yoga', 'Ayurveda', 'Homeopathy', 'Siddha'],
      correctAnswer: 'Ayurveda',
      selectedAnswer: ''
    },
    {
      question: 'Which part of the Neem tree is used for medicinal purposes?',
      options: ['Leaves', 'Bark', 'Seeds', 'All of the above'],
      correctAnswer: 'All of the above',
      selectedAnswer: ''
    },
    {
      question: 'What herb is traditionally used to boost memory and brain function?',
      options: ['Brahmi', 'Ginger', 'Tulsi', 'Lemongrass'],
      correctAnswer: 'Brahmi',
      selectedAnswer: ''
    },
    {
      question: 'Yoga is primarily associated with which aspect of health in AYUSH?',
      options: [
        'Physical fitness only',
        'Dietary practices',
        'Herbal medicine',
        'Mind-body harmony'
      ],
      correctAnswer: 'Mind-body harmony',
      selectedAnswer: ''
    }
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
    if (this.score > 5) {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Certificate of Achievement', 60, 40);
      doc.setFontSize(14);
      doc.text('This is to certify that you have successfully completed the quiz', 20, 60);
      doc.text(`Your Score: ${this.score}/10`, 20, 80);
      const grade = this.getGrade(this.score);
      doc.text(`Your Grade: ${grade}`, 20, 100);
      doc.save('Certificate.pdf');
    }
  }

  // Get grade based on score
  getGrade(score: number): string {
    switch (score) {
      case 10: return 'O';
      case 9: return 'A';
      case 8: return 'B';
      case 7: return 'C';
      case 6: return 'D';
      default: return '';
    }
  }
}
