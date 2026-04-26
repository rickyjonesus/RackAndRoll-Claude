import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActiveMatchService } from './core/services/active-match.service';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'web';
  protected activeMatch = inject(ActiveMatchService).current;
}
