import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnaniComponent } from './unani.component';

describe('UnaniComponent', () => {
  let component: UnaniComponent;
  let fixture: ComponentFixture<UnaniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnaniComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnaniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
