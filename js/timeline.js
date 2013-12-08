+ function($) {

  "use strict";

  var Timeline = function(element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.timeline.defaults, options)
    this.init()
    this.listen()

    return this
  }

  Timeline.prototype = {

    constructor: Timeline

    ,
    init: function() {
      this.$element.append('<div class="timeline-nav"><div class="timenav"><div class="timenav-content"></div><div class="timenav-time"><div class="time-interval-minor"><div class="minor"></div></div><div class="time-interval"></div></div></div><div class="timenav-background"><div class="timenav-line"></div><div class="timenav-interval-background"></div></div><ul class="timeline-toolbar"><li data-original-title="今天"><a href="#"><i class="fa fa-thumb-tack fa-fw"></i></a></li><li data-original-title="第一个"><a href="#"><i class="fa fa-reply fa-fw"></i></a></li><li data-original-title="最后一个"><a href="#"><i class="fa fa-share fa-fw"></i></a></li></ul><div class="timeline-slider"><div class="slider-control"><a href="#" class="btn control-left"><i class="fa fa-chevron-circle-left"></i></a><a href="#" class="btn control-right"><i class="fa fa-chevron-circle-right"></i></a><label class="control-date"></label><a href="#" class="control-close"><i class="fa fa-times-circle"></i></a></div><div class="slider-content"><div class="content-title"></div><div class="content-text"></div></div></div></div>')
      this.$content = this.$element.find('div.timenav-content')
      this.$timeline_nav = this.$element.find('div.timenav')
      this.$time_interval = this.$element.find('div.time-interval')
      this.$time_line = this.$element.find('div.timenav-line')
      this.$time_background = this.$element.find('div.timenav-background')

      this.$timeline_slider = this.$element.find('div.timeline-slider')
      this.$slider_control = this.$element.find('div.slider-control')
      this.$content_title = this.$element.find('div.content-title')
      this.$content_text = this.$element.find('div.content-text')
      this.$control_date = this.$element.find('label.control-date')

      this.$element.find('li[data-original-title]').tooltip({
        placement: 'right',
        container: 'body'
      })
      this.fetch()
    }

    ,
    fetch: function(url) {
      var that = this
      $.getJSON(url || this.options.remote, function(json, textStatus) {
        that._data = json
        that.build()
      });
    }

    ,
    refresh: function(filter) {
      if (this._data) {
        this.today_mark = false
        this.close_slider(true)
        this.build_marks(filter)
      }
    }

    ,
    build: function() {
      this._data.sort(function(a, b) {
        return a.start - b.start;
      })
      this.build_interval()
      this.build_marks()
      var l = this.$time_line.position().left + 25
      this.$timeline_nav.css({
        left: l + 'px'
      })
    }

    ,
    build_mark: function(data, top, index) {
      var _date = Date.parse(this.get_date(data.start, true)),
        _left = ((_date - this.start_date) / 60000) * 0.20833 + 25,
        _today = false

        this.max_x = _left - 25

      if (!this.today_mark && this.date_string(new Date(), '') == data.start.substr(0, 8))
        this.today_mark = _today = true

      return '<div data-index="' + index + '" class="marker' + (_today ? ' today' : '') + '" style="left:' + _left + 'px;">' +
        '<div class="flag" style="top: ' + top + 'px;">' +
        '<div class="flag-content"><i class="' + data.icon + '"></i>' +
        '<h3>' + data.title + '</h3></div></div>' +
        '<div class="dot" data-original-title="' + this.date_format(data.start, true) + '"></div><div class="line"></div></div>'
    }

    ,
    build_marks: function(filter) {
      var top = [53, 101, 5],
        pi = 0,
        data = [],
        last_date = this._data[0].start,
        marks = '',
        that = this

        $.each(this._data, function(i, v) {
          if (filter && !filter(v)) return true
          marks += that.build_mark(v, top[pi], i)
          pi++
          pi = pi >= 3 ? 0 : pi
        });

      this.$content.html(marks)
    }

    ,
    build_interval: function() {
      var _start = this.get_date(this._data[0].start, 1),
        _end = this._data[this._data.length - 1].start.substr(0, 8),
        _interval = '',
        max_point = 25,
        i = 0;

      this.start_date = Date.parse(_start)

      while (i < 2) {
        _interval += '<div style="left: ' + max_point + 'px;">' + this.date_string(_start, '-') + '</div>'
        _start.setDate(_start.getDate() + 1)
        if (this.date_string(_start, '') > _end) {
          i++
        }
        max_point += 300
      }
      this.$time_interval.html(_interval)
    }

    ,
    get_date: function(d, t) {
      var _d = new Date(d.substr(0, 4) + '-' + d.substr(4, 2) + '-' + d.substr(6, 2))
      if (t) {
        _d.setHours(t.toString() == '1' ? 0 : parseInt(d.substr(8, 2)) - 1)
        _d.setMinutes(t.toString() == '1' ? 0 : parseInt(d.substr(10, 2)) - 1)
        _d.setSeconds(0)
      }
      return _d
    }

    ,
    date_format: function(d, t) {
      var _d = d.substr(0, 4) + '-' + d.substr(4, 2) + '-' + d.substr(6, 2)
      if (t)
        _d += ' ' + d.substr(8, 2) + ':' + d.substr(10, 2)
      return _d
    }

    ,
    date_string: function(d, split, t) {
      var _f = function(f) {
        return f < 10 ? '0' + f : f
      }
      var r = d.getFullYear() + split + _f(d.getMonth() + 1) + split + _f(d.getDate())
      if (t)
        r += ' ' + _f(d.getHours()) + ":" + _f(d.getMinutes())
      return r
    }

    ,
    goto_mark: function(p) {
      this.$timeline_nav.animate({
        left: this.$time_line.position().left - p.position().left - 1
      }, 300);
    }

    ,
    build_slider: function(current, is_click) {
      this.$timeline_slider.fadeIn(300)
      var index = current.data().index

      if (is_click) {
        this.current_mark = current
        this.$content.children().removeClass('active')
        current.addClass('active')
      }

      this.$slider_control.children('a.control-left').toggleClass('disabled', current.prev().length == 0)
      this.$slider_control.children('a.control-right').toggleClass('disabled', current.next().length == 0)

      var d = this._data[index]
      this.$control_date.html(this.date_format(d.start, true) + '<br/>' + this.date_format(d.end, true))
      this.$content_title.html('<i class="' + d.icon + '"></i><h3>' + d.title + '</h3>')
      this.$content_text.html(d.text)
    }

    ,
    close_slider: function(is_close) {
      if (!is_close && this.current_mark) {
        this.build_slider(this.current_mark)
      } else {
        this.current_mark = null
        this.$timeline_slider.fadeOut(300)
        this.$content.children().removeClass('active')
      }
    }

    ,
    listen: function() {
      var that = this

      this.$slider_control.on('click', 'a', function(e) {
        if ($(this).hasClass('disabled')) return false

        if ($(this).hasClass('control-left')) {
          that.current_mark.prev().children('div.flag').trigger('click')
        } else if ($(this).hasClass('control-right')) {
          that.current_mark.next().children('div.flag').trigger('click')
        } else if ($(this).hasClass('control-close')) {
          that.close_slider(true)
        }
      })

      this.$element.find('ul.timeline-toolbar').on('click', 'li', function(e) {
        var p = $(this).data().originalTitle
        if (p == '第一个') {
          that.$content.children().first().children('div.flag').trigger('click')
        } else if (p == '最后一个') {
          that.$content.children().last().children('div.flag').trigger('click')
        } else if (p == '今天') {
          that.$content.children('div.today').children('div.flag').trigger('click')
        }
      })

      this.$content.on('mouseenter', 'div.flag', function(e) {
        var dot = $(this).next()
        if (!dot.data('bs.tooltip')) {
          dot.tooltip({
            placement: 'bottom'
          })
        }
        dot.tooltip('show')
        that.build_slider($(this).closest('div.marker'), false)
      }).on('mouseleave', 'div.flag', function(e) {
        $(this).next().tooltip('hide')
        that.close_slider(false)
      }).on('click', 'div.flag', function(e) {
        var marker = $(this).closest('div.marker')
        that.goto_mark(marker)
        that.build_slider(marker, true)
      })

      this._move = false

      this.$time_background.on('mousedown', function(e) {
        that.close_slider(true)
        that._move = true
        that._mouseDownEvent = e
        that._last_x = that.$timeline_nav.position().left
      }).on('mousemove', function(e) {
        if (that._move) {
          var l = that._last_x - (that._mouseDownEvent.pageX - e.pageX)
          var min = that.$time_line.position().left + 25
          if (l > min)
            l = min
          else if (l < 0 - that.max_x) l = 0 - that.max_x
          that.$timeline_nav.css({
            left: l + 'px'
          })
        }
      }).on('mouseup', function(e) {
        that._move = false
      })
    }
  }

  var old = $.fn.timeline

  $.fn.timeline = function(option) {
    var options = typeof option == 'object' && option
    this.each(function() {
      var $this = $(this),
        data = $this.data('timeline'),
        options = typeof option == 'object' && option
      if (!data) $this.data('timeline', (data = new Timeline(this, options)))
    })
    if (options.instance)
      return $(this).data('timeline')
    return this
  }

  $.fn.timeline.defaults = {}

  $.fn.timeline.Constructor = Timeline

  $.fn.timeline.noConflict = function() {
    $.fn.timeline = old
    return this
  }

  $(window).on('load', function() {
    $('[data-timeline]').each(function() {
      var $timeline = $(this)
      $timeline.timeline($timeline.data())
    })
  })

}(jQuery);