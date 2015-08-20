// jsFlashEngine https://github.com/crpietschmann/jsFlashEngine
// Copyright (c) 2015 Chris Pietschmann http://pietschsoft.com
// Licensed under MIT License https://github.com/crpietschmann/jsFlashEngine/blob/master/LICENSE
(function (window, $) {
	
	function getCurrentFlashCardSet(container){
		return container.find('.flashcard-pool > .flashcardset');
	}
	
	function getAllFlashCards(container){
		return container.find('.flashcard-pool > .flashcardset .flashcard');
	}
	
	function getFlashCardByIndex(container, index){
		return container.find('.flashcard-pool > .flashcardset .flashcard:nth-child(' + index + ')');
	}
	 
	function getNowDateTimeStamp() { 
		var dt = new Date(); 
		return dt.getMonth() + '/' + dt.getDate() + '/' + dt.getFullYear() + ' ' + dt.getHours() + ':' + (dt.getMinutes() >= 10 ? dt.getMinutes() : '0' + dt.getMinutes()); 
	} 
	
	var ViewModel = function (elem, options) {
		var self = this;
		self.element = $(elem);
		self.options = $.extend({}, engine.defaultOptions, options);
		
		self.element.find('.flashcard-pool').load(self.options.flashUrl, function() {
			// flash cards loaded into browser from HTML file
			
			getCurrentFlashCardSet(self.element).find('.answer').each(function (e, i){
				var elem = $(this);
				
				elem.hide();
			});
			
			self.flashcardCount(getAllFlashCards(self.element).length);
			self.flashTitle(getCurrentFlashCardSet(self.element).attr('data-title'));
			self.flashSubTitle(getCurrentFlashCardSet(self.element).attr('data-subtitle'));
		});
		
		self.flashStarted = ko.observable(false);
		self.flashComplete = ko.observable(false);
		
		self.flashTitle = ko.observable('');
		self.flashSubTitle = ko.observable('');
		self.flashcardCount = ko.observable(0);
		
		self.flashcardCorrectValues = {};
		self.isFlashCardCorrect = ko.observable(false);
		self.isFlashCardCorrect.subscribe(function (newValue) {
			var index = self.currentFlashCardIndex();
			self.flashcardCorrectValues[index] = newValue;
		});
		
		self.currentFlashCardIndex = ko.observable(0);
		self.currentFlashCardIndex.subscribe(function (newValue) {
			if (newValue < 1){
				self.currentFlashCardIndex(1);
			} else if (newValue > self.flashcardCount()) {
				self.currentFlashCardIndex(self.flashcardCount());
			} else {
				getAllFlashCards(self.element).hide();
				getFlashCardByIndex(self.element, newValue).show();
			}
			
			if (self.flashcardCount() !== 0) {
				self.currentProgress(self.currentFlashCardIndex() / self.flashcardCount() * 100);
			}
		});
		self.currentProgress = ko.observable(0);
		
		self.currentFlashCardIsFirst = ko.computed(function() {
			return self.currentFlashCardIndex() === 1;
		});
		self.currentFlashCardIsLast = ko.computed(function () {
			return self.currentFlashCardIndex() == self.flashcardCount();
		});
		
		self.startFlash = function() {
			// reset flash card set to start state
			self.currentFlashCardIndex(0);
			self.currentFlashCardIndex(1);
						
			self.flashStarted(true);	
		};
		
		function restoreCorrectIndicatorForCurrentFlashCard() {
			self.isFlashCardCorrect(self.flashcardCorrectValues[self.currentFlashCardIndex()] || false);
		}
		
		self.moveNextFlashCard = function () {
			self.currentFlashCardIndex(self.currentFlashCardIndex() + 1);
			restoreCorrectIndicatorForCurrentFlashCard();
		};
		self.movePreviousFlashCard = function () {
			self.currentFlashCardIndex(self.currentFlashCardIndex() - 1);
			restoreCorrectIndicatorForCurrentFlashCard();
		};
		self.showCurrentFlashCardAnswer = function () {
			var q = getFlashCardByIndex(self.element, self.currentFlashCardIndex());
			q.find('.answer').slideDown();
		};
		
		
		self.calculateScore = function () {
			var totalCorrect = 0;
			
			for(var i = 1; i <= self.flashcardCount(); i++) {
				var v = self.flashcardCorrectValues[i] || false;
				if (v === true) {
					totalCorrect++;
				}
			}
					
			self.totalFlashCardsCorrect(totalCorrect);
			
			if (self.flashcardCount() !== 0) {
				self.calculatedScore(totalCorrect / self.flashcardCount() * 100);
			}
			
			self.calculatedScoreDate(getNowDateTimeStamp());
			
			self.flashComplete(true);
		};
		self.totalFlashCardsCorrect = ko.observable(0);
		self.calculatedScore = ko.observable(0);
		self.calculatedScoreDate = ko.observable('');
		self.flashPassed = ko.computed(function() {
			return self.calculatedScore() >= 50;
		});
	};
	
	var engine = window.jsFlashEngine = function (elem, options) {
		return new engine.fn.init(elem, options);		
	};
	engine.defaultOptions = {
		flashUrl: 'original.htm'	
	};
	engine.fn = engine.prototype = {
		version: 0.1,
		init: function (elem, options) {
			var vm = new ViewModel(elem[0], options);
			ko.applyBindings(vm, elem[0]);
		}	
	};
	
})(window, jQuery);