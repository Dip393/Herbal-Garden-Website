import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiddhaComponent } from './siddha.component';

describe('SiddhaComponent', () => {
  let component: SiddhaComponent;
  let fixture: ComponentFixture<SiddhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiddhaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiddhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
