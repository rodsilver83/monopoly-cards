import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Card } from '../../classes/card';
import {
	Component,
	OnInit,
	ElementRef,
	ViewChild,
	ViewChildren,
	QueryList,
	HostListener,
	ChangeDetectorRef,
	AfterViewChecked,
	AfterViewInit,
} from '@angular/core';
import { DeckCardComponent } from '../deck-card/deck-card.component';
import { PlayerDataService } from '../../services/player-data.service';
import { GamePlayersService } from 'src/app/services/game-players.service';
import { Player } from 'src/app/classes/player';

@Component({
	selector: 'gs-hand-deck',
	templateUrl: './hand-deck.component.html',
	styleUrls: ['./hand-deck.component.scss'],
})
export class HandDeckComponent
	implements OnInit, AfterViewChecked, AfterViewInit {
	@ViewChild('handList') public handList: ElementRef;
	@ViewChildren('handCards') public handCards: QueryList<DeckCardComponent>;

	@HostListener('window:resize') public onResize(width: number = 0) {
		if (this.handCards?.length > 0) {
			const listWidth = width
				? width
				: this.handList.nativeElement.clientWidth - 100;
			this.lastListWidth = listWidth;
			const cardWidth = listWidth / this.handCards.length;
			this.handCards.forEach((card) => {
				card.el.nativeElement.style.width = cardWidth + 'px';
			});
			this.calculatingHandWidth = false;
			this.cd.detectChanges();
		}
	}

	public calculatingHandWidth = true;
	public isMyTurn = false;

	private lastListWidth = 0;

	constructor(
		public readonly playerDataService: PlayerDataService,
		private readonly gameService: GamePlayersService,
		private readonly cd: ChangeDetectorRef
	) {}

	ngAfterViewChecked() {
		this.calculatingHandWidth && this.onResize();
	}

	ngAfterViewInit() {
		this.handCards.changes.subscribe((r) => {
			this.onResize(this.lastListWidth);
		});
	}

	ngOnInit(): void {
		this.playerDataService.handCards$.subscribe((cards: Card[]) => {
			this.cd.detectChanges();
		});

		this.gameService.turn$.subscribe((player: Player) => {
			this.isMyTurn = this.playerDataService.playerName === player?.name;
			this.cd.detectChanges();
		});
	}

	dropHand(event: CdkDragDrop<Card[]>) {
		this.playerDataService.moveHand(event.previousIndex, event.currentIndex);
	}
}
