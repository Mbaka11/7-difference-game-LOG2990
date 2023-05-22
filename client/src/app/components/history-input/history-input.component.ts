import { Component, OnInit } from '@angular/core';
import { GameInfoHistory } from '@app/interfaces/game-info-history';
import { HistoryService } from '@app/services/history.service';

@Component({
    selector: 'app-history-input',
    templateUrl: './history-input.component.html',
    styleUrls: ['./history-input.component.scss'],
})
export class HistoryInputComponent implements OnInit {
    displayedColumns: string[] = ['date', 'duration', 'gameMode', 'players'];
    dataSource: GameInfoHistory[] = [];
    isEmpty: boolean = false;

    constructor(private historyService: HistoryService) {}

    async ngOnInit(): Promise<void> {
        this.dataSource = await this.historyService.getHistory();
        this.isEmpty = this.dataSource.length === 0;
    }
}
