import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent {

  // ==========================================
  // QUIZ QUESTIONS
  // ==========================================

  questions = [
    {
      question: 'What does AYUSH stand for?',
      options: [
        'Alternative Yoga for Universal Healing Sciences',
        'Ayurveda, Yoga, Unani, Siddha, and Healing',
        'Ayurveda, Yoga, Unani, Siddha, and Homoeopathy',
        'Ayurvedic Yoga and Unified System of Healing'
      ],
      correctAnswer:
        'Ayurveda, Yoga, Unani, Siddha, and Homoeopathy',
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
      options: [
        'Tulsi',
        'Neem',
        'Mint',
        'Curry leaf'
      ],
      correctAnswer: 'Tulsi',
      selectedAnswer: ''
    },

    {
      question:
        'Which herb is used for treating skin infections and has antibacterial properties?',
      options: [
        'Coriander',
        'Aloe Vera',
        'Basil',
        'Tulsi'
      ],
      correctAnswer: 'Aloe Vera',
      selectedAnswer: ''
    },

    {
      question:
        'What is the ideal environment for growing herbal plants?',
      options: [
        'Low sunlight and wet soil',
        'Heavy sunlight and water-logged soil',
        'Complete shade and dry soil',
        'Moderate sunlight and well-drained soil'
      ],
      correctAnswer:
        'Moderate sunlight and well-drained soil',
      selectedAnswer: ''
    },

    {
      question:
        'Ashwagandha is commonly used in herbal medicine for its properties to improve:',
      options: [
        'Digestion',
        'Immunity',
        'Stress and anxiety',
        'Skin health'
      ],
      correctAnswer: 'Stress and anxiety',
      selectedAnswer: ''
    },

    {
      question:
        'Which AYUSH system uses plants like Kalmegh and Mulethi for treatment?',
      options: [
        'Yoga',
        'Ayurveda',
        'Homeopathy',
        'Siddha'
      ],
      correctAnswer: 'Ayurveda',
      selectedAnswer: ''
    },

    {
      question:
        'Which part of the Neem tree is used for medicinal purposes?',
      options: [
        'Leaves',
        'Bark',
        'Seeds',
        'All of the above'
      ],
      correctAnswer: 'All of the above',
      selectedAnswer: ''
    },

    {
      question:
        'What herb is traditionally used to boost memory and brain function?',
      options: [
        'Brahmi',
        'Ginger',
        'Tulsi',
        'Lemongrass'
      ],
      correctAnswer: 'Brahmi',
      selectedAnswer: ''
    },

    {
      question:
        'Yoga is primarily associated with which aspect of health in AYUSH?',
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


  // ==========================================
  // QUIZ STATE
  // ==========================================

  score = 0;
  showResult = false;


  // ==========================================
  // CALCULATE SCORE
  // ==========================================

  calculateScore(): void {

    this.score = 0;

    this.questions.forEach((question) => {

      if (
        question.selectedAnswer ===
        question.correctAnswer
      ) {
        this.score++;
      }

    });

    this.showResult = true;
  }


  // ==========================================
  // GENERATE CERTIFICATE
  // ==========================================

  generateCertificate(): void {

    const doc = new jsPDF();

    // ------------------------------------------
    // Page border
    // ------------------------------------------

    doc.setLineWidth(1);

    doc.rect(
      10,
      10,
      190,
      277
    );


    // ------------------------------------------
    // Certificate title
    // ------------------------------------------

    doc.setFontSize(26);

    doc.setFont('helvetica', 'bold');

    doc.text(
      'Certificate of Achievement',
      105,
      45,
      {
        align: 'center'
      }
    );


    // ------------------------------------------
    // Subtitle
    // ------------------------------------------

    doc.setFontSize(16);

    doc.setFont('helvetica', 'normal');

    doc.text(
      'Herbal Quiz',
      105,
      65,
      {
        align: 'center'
      }
    );


    // ------------------------------------------
    // Achievement text
    // ------------------------------------------

    doc.setFontSize(14);

    doc.text(
      'This is to certify that the participant',
      105,
      90,
      {
        align: 'center'
      }
    );

    doc.text(
      'has successfully completed the Herbal Quiz.',
      105,
      102,
      {
        align: 'center'
      }
    );


    // ------------------------------------------
    // Score
    // ------------------------------------------

    doc.setFontSize(20);

    doc.setFont('helvetica', 'bold');

    doc.text(
      `Score: ${this.score}/10`,
      105,
      135,
      {
        align: 'center'
      }
    );


    // ------------------------------------------
    // Grade
    // ------------------------------------------

    const grade = this.getGrade(this.score);

    if (grade) {

      doc.setFontSize(18);

      doc.text(
        `Grade: ${grade}`,
        105,
        155,
        {
          align: 'center'
        }
      );

    }


    // ------------------------------------------
    // Date
    // ------------------------------------------

    const currentDate =
      new Date().toLocaleDateString(
        'en-IN'
      );

    doc.setFontSize(12);

    doc.setFont('helvetica', 'normal');

    doc.text(
      `Date: ${currentDate}`,
      105,
      185,
      {
        align: 'center'
      }
    );


    // ------------------------------------------
    // Footer
    // ------------------------------------------

    doc.setFontSize(11);

    doc.text(
      'AYUSH Virtual Herbal Garden',
      105,
      235,
      {
        align: 'center'
      }
    );

    doc.text(
      'Ministry of AYUSH',
      105,
      247,
      {
        align: 'center'
      }
    );


    // ------------------------------------------
    // Download PDF
    // ------------------------------------------

    doc.save(
      'Herbal-Quiz-Certificate.pdf'
    );
  }


  // ==========================================
  // GET GRADE
  // ==========================================

  getGrade(score: number): string {

    switch (score) {

      case 10:
        return 'O';

      case 9:
        return 'A';

      case 8:
        return 'B';

      case 7:
        return 'C';

      case 6:
        return 'D';

      default:
        return '';
    }
  }

}