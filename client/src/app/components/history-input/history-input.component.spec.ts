import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryService } from '@app/services/history.service';
import { HistoryInputComponent } from './history-input.component';

describe('HistoryInputComponent', () => {
    let component: HistoryInputComponent;
    let fixture: ComponentFixture<HistoryInputComponent>;
    let historyService: HistoryService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HistoryInputComponent],
            providers: [HistoryService],
        }).compileComponents();

        fixture = TestBed.createComponent(HistoryInputComponent);
        component = fixture.componentInstance;
        historyService = TestBed.inject(HistoryService);
        spyOn(historyService, 'getHistory').and.returnValue(Promise.resolve([]));
        fixture.detectChanges();
    });

    it('should set isEmpty to true when dataSource is empty', async () => {
        component.dataSource = [];
        await component.ngOnInit();
        expect(component.isEmpty).toBe(true);
    });
});
