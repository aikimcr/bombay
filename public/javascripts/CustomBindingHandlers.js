ko.bindingHandlers.searchableSelect = Sapphire.searchableSelect;

ko.bindingHandlers.clickRating = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      element.value = 0;
      var getTargetValue = function(event) {
        return parseInt(event.target.getAttribute('value'));
      };

      element.classList.add('rating_container');
      for (var i = 1; i <= 5; i++) {
        var clicker = document.createElement('div');
        clicker.setAttribute('value', i);
        clicker.classList.add('rating_clicker');
        element.appendChild(clicker);
      }

      element.addEventListener('mouseover', function(event) {
        var clickers = event.target.parentElement.children;
        var index = getTargetValue(event);

        for(var i=0; i < clickers.length; i++) {
          clickers[i].classList.remove('rating_clicker_hover');
          if (i < index) clickers[i].classList.add('rating_clicker_hover');
        }
      });
      element.addEventListener('mouseout', function(event) {
        var clickers = event.target.parentElement.children;
        var index = getTargetValue(event);

        for(var i=0; i < clickers.length; i++) {
          clickers[i].classList.remove('rating_clicker_hover');
        }
      });
      element.addEventListener('click', function(event) {
        var index = getTargetValue(event);
        var observable = valueAccessor();
        observable(index);
        //element.value = index;
        //this.dispatchEvent(new Event('change'));
      }.bind(element));
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var observable = valueAccessor();
      var index = observable();

      if (element.value != index) {
        var clickers = element.children;

        for(var i=0; i < clickers.length; i++) {
          clickers[i].classList.remove('rating_clicker_selected');
          if (i < index) clickers[i].classList.add('rating_clicker_selected');
        }
        element.value = index;
        element.dispatchEvent(new Event('change'));
      }
    }
};

ko.bindingHandlers.showRating = {
    init: function(element, valueAccessor) {
      element.classList.add('rating_container');
      var rating = document.createElement('div');
      rating.classList.add('rating_value');
      element.appendChild(rating);
    },
    update: function(element, valueAccessor) {
      var observable = valueAccessor();
      var value = parseInt((observable() * 10) + .5) / 10;
      var width = parseInt(value * 20) + 'px';
      element.firstChild.style.width = width;
    },
};
