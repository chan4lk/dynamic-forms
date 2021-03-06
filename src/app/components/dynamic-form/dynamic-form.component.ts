import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FieldConfig } from 'src/app/field.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form',
  template: `
    <form class="dynamic-form" [formGroup]="form" (submit)="onSubmit($event)">
      <ng-container
        *ngFor="let field of fields"
        appDynamicField
        [field]="field"
        [group]="form"
      >
      </ng-container>
    </form>
  `,
  styles: []
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: FieldConfig[] = [];
  // tslint:disable-next-line: no-output-native
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  form: FormGroup;

  get value() {
    return this.form.value;
  }
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.createControl();
  }

  createControl() {
    const group = this.fb.group({});
    this.fields.forEach(field => {
      if (field.type === 'button') {
        return;
      }

      const control = this.fb.control(
        field.value,
        this.bindValidations(field.validations || [])
      );

      group.addControl(field.name, control);
    });

    return group;
  }

  bindValidations(validations: any) {
    if (validations.length > 0) {
      const validList = [];
      validations.forEach(valid => {
        validList.push(valid.validator);
      });

      return Validators.compose(validList);
    }

    return null;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.form.valid) {
      this.submit.emit(this.form.value);
    } else {
      this.validateAllFormFields(this.form);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control.markAsTouched({onlySelf: true});
    });
  }
}
