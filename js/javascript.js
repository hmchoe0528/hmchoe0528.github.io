var versionUpdate='2.2.1';
// 2.0.0 
// 2.0.1 with copy-right
// 2.1.0 with selected pubs and projs.
// 2.2.0 with calendar
// 2.2.1 with automized calendar
var lang = 'eng';
var langs = ['eng','kor']

function loadMenubar() {
	$('.load-menubar').load('default.html #menubar', function(){
		//Color menu item of current page
		var paths = location.href.split('/');
		paths = paths[paths.length - 1].split('?')[0];
		$(this).find('.right-menu-menu a').each(function(){
			if($(this).attr('href') !== undefined)
				if($(this).attr('href').split('?')[0] === paths)
					$(this).addClass('this-page');
		});
		$(this).find('.right-menu-dropmenu a').each(function(){
			if($(this).attr('href') !== undefined)
				if($(this).attr('href').split('?')[0] === paths)
					$(this).addClass('this-page');
		});
		$(this).find('.lang-kor').each(function(){
			$(this).attr('href', location.href.split('?')[0] + '?lang=kor');
		});
		$(this).find('.lang-eng').each(function(){
			$(this).attr('href', location.href.split('?')[0] + '?lang=eng');
		});
		//Click Event: dropmenu-down
		$('.right-menu-button').on('click', function(e){
			e.preventDefault();
			$(this).parent().children('.right-menu-dropmenu').slideToggle(300);
			return false;
		});
		$(this).find('.logo-link').attr('href','.'+'?lang='+lang);
		show_lang($(this),lang);
		logoEasterEgg($(this));
	});
}

// Easter egg, only on pages whose <body> has data-logo-egg (personal.html): rest the mouse on the
// header logo for about a second and a bubble with the Hangul jamo opens beside it;
// ㄷ ㅐ ㅇ ㅌ light up and hop one by one into the logo.
// The pieces are cut from assets/icons/logo-choe.svg itself (its <rect> frame and its four <path>s,
// in the order ㄷ ㅐ ㅇ ㅌ), so the animation follows the logo file.
function logoEasterEgg(menubar) {
	var link = menubar.find('.logo-link'), img = link.find('img');
	if (!document.body.hasAttribute('data-logo-egg')) return;
	if (!img.length || !window.fetch || !Element.prototype.animate) return;
	var NS = 'http://www.w3.org/2000/svg';
	// Timing (ms): jamo light up LIGHT_STEP_MS apart; the first hop starts at FIRST_HOP_MS;
	// pieces leave HOP_STEP_MS apart and each hop takes HOP_MS.
	var LIGHT_STEP_MS = 300, FIRST_HOP_MS = 1300, HOP_STEP_MS = 400, HOP_MS = 1050;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var row = function(chars){
		return '<div class="logo-egg-row">' + chars.split('').map(function(c){ return '<span>' + c + '</span>'; }).join('') + '</div>';
	};
	var bubble = $('<div class="logo-egg-bubble" aria-hidden="true">'
		+ '<div class="logo-egg-label">한글 Hangul</div>'
		+ row('ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ') + row('ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ') + '</div>');
	var stage = $('<div class="logo-egg-stage" aria-hidden="true"></div>');
	link.parent().append(stage, bubble);

	var spans = bubble.find('span').toArray();
	var sources = ['ㄷ', 'ㅐ', 'ㅇ', 'ㅌ'].map(function(ch){ return spans.filter(function(s){ return s.textContent === ch; })[0]; });
	var frame, pieces, holdTimer, hideTimer, timers = [], playing = false;
	var later = function(ms, fn){ timers.push(setTimeout(fn, ms)); };

	function layer(child) {
		var svg = document.createElementNS(NS, 'svg');
		svg.setAttribute('viewBox', '0 0 300 300');
		svg.style.opacity = 0;
		svg.appendChild(child);
		stage[0].appendChild(svg);
		return svg;
	}

	fetch('assets/icons/logo-choe.svg').then(function(r){ return r.text(); }).then(function(text){
		var doc = new DOMParser().parseFromString(text, 'image/svg+xml'), group = doc.querySelector('g');
		frame = layer(document.importNode(doc.querySelector('rect'), true));
		pieces = Array.prototype.map.call(group.querySelectorAll('path'), function(path){
			var g = document.createElementNS(NS, 'g');
			g.setAttribute('transform', group.getAttribute('transform'));
			g.setAttribute('fill', group.getAttribute('fill') || '#000');
			g.appendChild(document.importNode(path, true));
			return layer(g);
		});
		link.on('mouseenter', function(){
			clearTimeout(hideTimer);
			if (!playing) holdTimer = setTimeout(play, 900);
		});
		link.on('mouseleave', function(){
			clearTimeout(holdTimer);
			hideTimer = setTimeout(finish, 1200);
		});
	}).catch(function(){});

	function finish() {
		if (playing) { hideTimer = setTimeout(finish, 400); return; }
		timers.forEach(clearTimeout);
		timers = [];
		bubble.removeClass('show');
		[frame].concat(pieces).forEach(function(el){
			el.getAnimations().forEach(function(a){ a.cancel(); });
			el.style.opacity = 0;
		});
		$(spans).removeClass('on');
		img.css('visibility', '');
	}

	// Parabolic hop from the jamo in the bubble to the piece's place in the logo, with a squash on landing.
	function hop(i) {
		var svg = pieces[i], box = stage[0].getBoundingClientRect();
		var src = sources[i].getBoundingClientRect(), dst = svg.querySelector('path').getBoundingClientRect();
		var dx = (src.left + src.width / 2) - (dst.left + dst.width / 2);
		var dy = (src.top + src.height / 2) - (dst.top + dst.height / 2);
		// H: arc height in px; kept low so the hop stays below the top edge of the page (logo sits 25px from it)
		var s0 = 0.8 * src.height / dst.height, H = 20, N = 16, keys = [];
		svg.style.transformOrigin = (dst.left + dst.width / 2 - box.left) + 'px ' + (dst.top + dst.height / 2 - box.top) + 'px';
		for (var k = 0; k <= N; k++) {
			var t = k / N;
			keys.push({ offset: 0.8 * t, opacity: Math.min(1, 6 * t),
				transform: 'translate(' + dx * (1 - t) + 'px,' + (dy * (1 - t) - 4 * H * t * (1 - t)) + 'px) scale(' + (s0 + (1 - s0) * t) + ')' });
		}
		keys.push({ offset: 0.88, opacity: 1, transform: 'scale(1.15, 0.8)' });
		keys.push({ offset: 0.95, opacity: 1, transform: 'scale(0.95, 1.07)' });
		keys.push({ offset: 1, opacity: 1, transform: 'none' });
		svg.animate(keys, { duration: HOP_MS, easing: 'linear', fill: 'forwards' });
	}

	function play() {
		finish();
		playing = true;
		var pos = img.position(), w = img.outerWidth(), h = img.outerHeight();
		stage.css({ left: pos.left, top: pos.top, width: w, height: h });
		// The bubble opens to the right of the logo and stops short of the right menu
		// (the menu links on desktop, the hamburger button on mobile); rows wrap if it is narrow.
		var menuLeft = window.innerWidth;
		menubar.find('.right-menu-menu a:visible, .right-menu-button:visible').each(function(){
			menuLeft = Math.min(menuLeft, this.getBoundingClientRect().left);
		});
		var gap = 14, bubbleLeft = img[0].getBoundingClientRect().right + gap;
		bubble.css({ left: pos.left + w + gap, top: pos.top, maxWidth: Math.max(120, menuLeft - bubbleLeft - 12) }).addClass('show');
		sources.forEach(function(s, i){ later(i * LIGHT_STEP_MS, function(){ $(s).addClass('on'); }); });
		if (reduceMotion) { playing = false; return; }
		img.css('visibility', 'hidden');
		frame.style.opacity = 1;
		later(FIRST_HOP_MS, function(){
			pieces.forEach(function(p, i){ later(i * HOP_STEP_MS, function(){ hop(i); }); });
		});
		later(FIRST_HOP_MS + 3 * HOP_STEP_MS + HOP_MS, function(){ playing = false; });
	}
}

function loadFooter() {
	//Click Event: go-to-top
	$('.load-footer').load('default.html #footer', function(){
		lastUpdated();
		$('._goto-top').on('click', function(e){
			e.preventDefault();
			$('html, body').stop().animate({
				scrollTop: 0
			}, 600);
			return false;
		});
	});
}

function updateAge(){
	if( $('.update-birth').length > 0 ){
		var myAge;
		// var birth = new Date(Date.parse('1994 May 28 0:0:0 UTC')).getTime();
		var birth = new Date(Date.parse('1994/5/28')).getTime();
		setInterval(function(){
			myAge = new Number(new Date(new Date().getTime() - birth) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(10);
			$('.update-birth p').text(myAge);
		}, 100);
	}
}

$(document).ready(function()
{	
	update_lang();

	loadMenubar();
	loadFooter();
	updateAge();



	applyClickEvent(); 

	mobile();
	heightNavigation();
	resizeHeightNavigation();
	
	$(window).on('scroll', function(){
		scrollSpy();
    });

	$(window).on('resize', function(){
		resizeHeightNavigation();
		scrollSpy();
		$('.right-menu-dropmenu').hide();
	});

	show_lang($(this),lang);

	$(window).load(function(){
		$('html').css('display', 'block');
		scrollSpy();
		lastUpdated();
	});

});

function update_lang(){
	temp = location.href.split(/[?&#]+/);
	for(var t in temp){
		if(t > 0) {
			data = temp[t].split('=');
			if(data[0] === 'lang')
				lang = data[1];
		}
	}
}

function show_lang(that,language){
	for(var l in langs){
		if(langs[l] === language){
			$(that).find('.'+langs[l]).each(function(){$(this).show()});
		} else {
			$(that).find('.'+langs[l]).each(function(){$(this).hide()});
		}
	};
	
}

function date_mmmddyy(date)
{
	return date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: '2-digit'});
}

function lastUpdated(){
	if($('.update-time').length){
		var s  = "Unknown";
		var d1;
		if(0 != (d1=Date.parse(document.lastModified))) {
			s = "" + date_mmmddyy(new Date(d1));
		}
	  
		$('.update-time').text('Last updated on ' + s);
	}
	if($('.current-version').length){
		$('.current-version').text('Version ' + versionUpdate);
	}
}


function applyClickEvent()
{
	
	//Seemore in the header
	$('._see-more').on('click', function(e){
		e.preventDefault();
		$('html, body').stop().animate({
			scrollTop: $('._contents').offset().top
		}, 600);
		return false;
	});
	//Items in the navigation
	$('._nav-bar ._toggle').on('click', function(e){
		e.preventDefault();
		$('._nav-bar').each(function(){
			if($(this).children('._nav-menu').is(":visible")) {
				$(this).children('._toggle').text($(this).children('._nav-menu').find('._active').text());
				$(this).children('._toggle').css("opacity","1");
				$(this).children('._toggle2').css("opacity","1");
			} else {
				$(this).children('._toggle').css("opacity","0");
				$(this).children('._toggle2').css("opacity","0");
			}
		});
		$('._nav-bar ._nav-menu').slideToggle(400);
		return false;
	});
	$('._nav-bar ._nav-menu li').on('click', function(e) {
		e.preventDefault();
		if( $.attr(this, 'class').split(" ")[0].length > 0 ) {
			$('html, body').stop().animate({
				scrollTop: $('._track[id="' + $.attr(this, 'class').split(" ")[0] +'"]').offset().top
			}, 600);
		}
		return false;
	});

	//section up and down
	$('.section-up').on('click', function(e) {
		if($('._track[id="'+tmpActiveSection+'"]').offset().top - $(window).scrollTop() > -50){
			prevActiveSection=$('._track').attr('id');
			tmpActiveSection=$('._track').attr('id');
			$('._track').each(function(){
				prevActiveSection=tmpActiveSection;
				tmpActiveSection=$(this).attr('id');
				if(tmpActiveSection === activeSection)
					return false;
			});
		} else {
			prevActiveSection=activeSection;
		}
		
		$('html, body').stop().animate({
			scrollTop: $('._track[id="' + prevActiveSection +'"]').offset().top
		}, 600);
	});
	$('.section-down').on('click', function(e) {
		tmpActiveSection=$('._track').attr('id');
		nextActiveSection=$('._track').attr('id');
		$('._track').each(function(){
			if($(this).attr('id') === 'header')
				return true;
			tmpActiveSection=nextActiveSection;
			nextActiveSection=$(this).attr('id');
			if(tmpActiveSection === activeSection)
				return false;
		});
		$('html, body').stop().animate({
			scrollTop: $('._track[id="' + nextActiveSection +'"]').offset().top
		}, 600);
	});
	$('.section-top').on('click', function(e){
		e.preventDefault();
		$('html, body').stop().animate({
			scrollTop: 0
		}, 600);
		return false;
	});

}

function updateTmpActiveSection(){
	tmpActiveSection=$('._track').attr('id');
    $('._track').each(function(){
        if( ($(this).offset().top - $(window).scrollTop() ) < 120)
			tmpActiveSection=$(this).attr('id');
	});
}
function scrollSpy() 
{
	updateTmpActiveSection();
	if((activeSection !== tmpActiveSection) && (tmpActiveSection !== 'header') && (tmpActiveSection !== 'footer')){
		if($('._nav-bar ._nav-menu').length){
			$('._nav-bar ._nav-menu .' + activeSection).removeClass('_active');
			$('._nav-bar ._nav-menu .' + tmpActiveSection).addClass('_active');
		}
		$('._nav-bar').each(function(){
			$(this).find('._toggle').text($(this).find('._active').text());
		});
	}
	activeSection = tmpActiveSection;

	//Stick navigation
	if($(window).scrollTop() + 65 < $('header').height()) { //85=(5+45)+40
		$("._nav-bar").addClass('_nav-bar-collapse');
		$("._nav-bar").removeClass('_nav-bar-fix');
		$("._nav-bar").removeClass('_nav-bar-collapse2');
	
	} else if($(window).scrollTop() + 15 + $('._nav-bar').height() - 10 > $(document).height() - $('footer').height()) {
		$("._nav-bar").addClass('_nav-bar-collapse2');
		$("._nav-bar").removeClass('_nav-bar-fix');
		$("._nav-bar").removeClass('_nav-bar-collapse');
	} else {
		$("._nav-bar").addClass('_nav-bar-fix');
		$("._nav-bar").removeClass('_nav-bar-collapse');
		$("._nav-bar").removeClass('_nav-bar-collapse2');
	}

}

function mobile() {
	if($(window).width() < 1000) {
		$('._nav-bar').each(function(){
			$(this).children('._toggle').text($(this).find('._active').text());
			$(this).children('._toggle').css("opacity","1");
			$(this).children('._toggle2').css("opacity","1");
			$(this).children('._nav-menu').hide();
		});
	} else if ($('._nav-bar ._nav-menu').length) {
		activeSection = $('._contents ._track').attr('id');
		$('._nav-bar ._nav-menu .' + activeSection).addClass('_active');
	}
}

function resizeHeightNavigation()
{
	var preferedHeight = 0;
	$('._nav-bar ._nav-menu').each(function(){
		preferedHeight = (($(window).height() - 130) / $(this).find('li').length);
		$(this).find('li').each(function(){
			$(this).css ({
				height: (preferedHeight) + 'px',
				'line-height': (preferedHeight) + 'px'
			});
		});
	});
}
function heightNavigation()
{
	var windowHeight = $(window).height();
	$('.tall-header').each(function(){
		$(this).css({
			'min-height': (windowHeight) + 'px'
		});
	});
}
