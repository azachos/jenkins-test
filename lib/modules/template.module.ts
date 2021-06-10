import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { JuniperModule } from 'lib-juniper';
import { PlatformHeaderModule } from 'lib-platform-header';

import { TemplateRoutingModule } from './template-routing.module';
import { TemplateComponent } from '../components/template/template.component';

import { Environment } from '../interfaces/environment';
import { TemplateService } from '../services/template.service';

import de from '../translations/de.json';
import en from '../translations/en.json';
import fr from '../translations/fr.json';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    JuniperModule,
    PlatformHeaderModule,
    TemplateRoutingModule
  ],
  declarations: [
    TemplateComponent
  ]
})
export class TemplateModule {

  constructor(
    private translateService: TranslateService
  ) {
    this.translateService.setTranslation('en', en, true);
    this.translateService.setTranslation('de', de, true);
    this.translateService.setTranslation('fr', fr, true);

    this.translateService.use('en');
  }

  public static forRoot(environment: Environment): ModuleWithProviders<TemplateModule> {
    return {
      ngModule: TemplateModule,
      providers: [{
        provide: TemplateService,
        useClass: TemplateService,
      }, {
        provide: 'env',
        useValue: environment
      }]
    };
  }

}
