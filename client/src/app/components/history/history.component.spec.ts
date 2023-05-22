import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { HistoryService } from '@app/services/history.service';
import { HistoryComponent } from './history.component';

describe('HistoryComponent', () => {
    let component: HistoryComponent;
    let fixture: ComponentFixture<HistoryComponent>;
    let mockHistoryService: jasmine.SpyObj<HistoryService>;
    let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<HistoryComponent>>;

    beforeEach(() => {
        mockHistoryService = jasmine.createSpyObj('HistoryService', ['isEmpty', 'clearHistory']);
        mockMatDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            declarations: [HistoryComponent],
            providers: [
                { provide: HistoryService, useValue: mockHistoryService },
                { provide: MatDialogRef, useValue: mockMatDialogRef },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should call clearHistory and close the dialog when clearHistory is called', async () => {
        mockHistoryService.isEmpty.and.returnValue(Promise.resolve(false));

        component.clearHistory();

        expect(mockHistoryService.clearHistory).toHaveBeenCalled();
        expect(mockMatDialogRef.close).toHaveBeenCalled();
    });
});
