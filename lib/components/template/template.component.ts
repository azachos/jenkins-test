import { Component, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

import { ButtonVariant, JuniperComponent } from "lib-juniper";

import { TemplateService } from "../../services/template.service";

@Component({
  selector: 'pup-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent extends JuniperComponent {

  readonly ButtonVariant = ButtonVariant;

  constructor(
    ref: ElementRef,
    private templateService: TemplateService,
    private translateService: TranslateService
  ) {
    super(ref);
  }

  get locale() {
    return this.translateService.currentLang;
  }

  set locale(locale: string) {
    this.translateService.use(locale);
  }

  get languages() {
    return this.translateService.langs;
  }

}
