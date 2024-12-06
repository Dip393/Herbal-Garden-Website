import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NaturopathyComponent } from './naturopathy.component';

describe('NaturopathyComponent', () => {
  let component: NaturopathyComponent;
  let fixture: ComponentFixture<NaturopathyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaturopathyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NaturopathyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
