import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.translateService.use('en');

    this.route.queryParams.subscribe((params: { hl?: string }) => {
      if (params.hl) {
        this.translateService.use(params.hl);
      }
    });
  }

}
