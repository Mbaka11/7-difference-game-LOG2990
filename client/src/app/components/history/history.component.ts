import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HistoryService } from '@app/services/history.service';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
    isEmpty: boolean = false;

    constructor(public historyService: HistoryService, private dialogRef: MatDialogRef<HistoryComponent>) {}

    async ngOnInit(): Promise<void> {
        this.isEmpty = await this.historyService.isEmpty();
    }

    clearHistory(): void {
        this.historyService.clearHistory();
        this.dialogRef.close();
    }
}
