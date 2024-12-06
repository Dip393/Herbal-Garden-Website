import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeopathyComponent } from './homeopathy.component';

describe('HomeopathyComponent', () => {
  let component: HomeopathyComponent;
  let fixture: ComponentFixture<HomeopathyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeopathyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeopathyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
