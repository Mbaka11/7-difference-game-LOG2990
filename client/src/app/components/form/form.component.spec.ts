import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { FormComponent } from './form.component';

describe('FormComponent', () => {
    let component: FormComponent;
    let fixture: ComponentFixture<FormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FormComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should emit username on form submission', () => {
        const form = new FormGroup({ username: new FormControl('testuser') });
        component.form = form;

        const spy = spyOn(component.username, 'emit');
        component.ngSubmit();

        expect(spy).toHaveBeenCalled();
    });

    it('should emit the username with undefined if the form does not have one', () => {
        const form = new FormGroup({ username: new FormControl('testuser') });
        component.form = form;
        spyOn(component.form, 'get');
        spyOn(component.username, 'emit');
        component.ngSubmit();
        expect(component.username.emit).toHaveBeenCalledWith(undefined);
    });
});
