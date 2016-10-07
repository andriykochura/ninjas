$(function() {

	var dataLink = 'https://gist.githubusercontent.com/andriykochura/703231136751dea213997fc85a67c541/raw/80f2edb648986735679083f4e27075a5fd25dbf3/newdata.xml';
	// var dataLink = 'data/TMNT.xml';

	
	var	model = {
		turtles: [],
		filters: [	
			{ values: ['All colors'], name: 'colors'}, 
			{ values: ['All weapons'], name: 'weapons'}
		],
		selected: {
			weapons: 'All weapons',
			colors: 'All colors'
		}
	};

	var view = {
		update: updateView,
		change: changeView
	};

	// $.support.cors = true;

	$.ajax(dataLink)
	.done(
		setupModel,
		setupView,
		setupEvents
	)
	.fail(reject);

	///////////////////////////////////////////

	function setupModel(data) {

		var filters = {
			colors: {},
			weapons: {}
		};
		
		$($.parseXML(data)).find('turtle').each(function() {
			var $this  = $(this);
			var props  = ['name', 'color', 'weapon', 'description', 'imageSource'];
			var tmodel = props.reduce(function(model, prop) {
				return (model[prop] = $this.find(prop).text(), model)
			}, { shown: true });
			
			filters.weapons[tmodel.weapon] = 1;
			filters.colors[tmodel.color] = 1;		

			model.turtles.push(tmodel);
  	});

  	model.filters.forEach(function(f){
  		f.values.push.apply(f.values, Object.keys(filters[f.name]))
  	})

	}

	// -- //

	function setupView() {

		var heroList = $('.ninja-list')
		var template = $('.ninja-list-item')

		model.turtles.forEach(function(turtle, index) {
			template.clone().removeClass('hide').attr('index', index)
				.find('img').attr('src', turtle.imageSource).end()
				.find('span').html(turtle.name).end()
			.appendTo(heroList)
		});

		model.filters.forEach(function(filter) {
			var parent = $('.ninja-filters');
			var select = $('<select>').attr('name', filter.name);
			filter.values.forEach(function(e) {
				select.append($("<option>").attr('value',e).text(e));
			})
			select.appendTo(parent).wrap('<div class="filter-item"></div>');
		});

		template.remove();
	}

	// -- //

	function setupEvents() {

		$('select').change(applyFilter);
		$('.back-to-list').click(view.change);
		$('.ninja-list-item').click(showDetails);

		function applyFilter() {
			model.selected[this.name] = $(this).val();
			view.update();
		}		

		function showDetails(e) {
			var index = $(this).attr('index');
			var turtle = model.turtles[index];

			$('.main-view').eq(1)
				.find('img').attr('src', turtle.imageSource).end()
				.find('h2').html(turtle.name).end()
				.find('ul').empty()
					.append($("<li>").text('Weapon: ' + turtle.weapon))
					.append($("<li>").text('Color: ' + turtle.color)).end()
				.find('p').html(turtle.description);

			view.change();
		}		
	}

	// -- //

	function changeView(){
		$('.main-view').slideToggle()
		$('.main-view').toggleClass('hide')
	}

	function updateView() {
		var isShown = function (turtle) {
			var selWeapon	 = model.selected.weapons;
			var selColor   = model.selected.colors;
			var allColors  = (selColor == 'All colors');
			var allWeapons = (selWeapon == 'All weapons');

			if(allWeapons && allColors) return true;
			if(allWeapons) return (turtle.color == selColor);
			if(allColors ) return (turtle.weapon == selWeapon);

			return (turtle.color == selColor) && (turtle.weapon == selWeapon)
		}

		var viewList = $('.ninja-list-item');

		model.turtles.forEach(function(turtle, index) {
			turtle.shown = isShown(turtle);
			turtle.shown ? viewList.eq(index).removeClass('hide') : viewList.eq(index).addClass('hide');
		});	
	}

	function reject(e) { 
		console.log(' Error! ', e) 
	}

});