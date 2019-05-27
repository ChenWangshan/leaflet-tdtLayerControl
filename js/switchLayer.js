var $ = $ || window;
$.switchMap = (function(map, option){

	L.TileLayer.TiandituLayer = L.TileLayer.extend({
		getTileUrl:function (tilePoint) {
		var h = parseInt(Math.random()*7);
		var layerType = this.options.layerType;
		var url = "http://t" + h + ".tianditu.gov.cn/"+layerType+"_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER="+layerType+"&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&" + "TILECOL=" + tilePoint.x + "&TILEROW=" + tilePoint.y + "&TILEMATRIX=" + tilePoint.z+"&tk=1072d95046f18e67463ce40d645a9b8d";
		return url;
		}
	});

	L.tileLayer.tiandituLayer = function(options){
		return new L.TileLayer.TiandituLayer('', options);
	};

	var sheetNumber = 'GS(2018)1432号 - 甲测资字1100471';

  	// 图幅号控件类
  	var SheetControl = L.Control.extend({
		initialize: function (options) {
	        this._options = options;
	        L.Util.setOptions(this, options);
	    },
	    onAdd: function (map) {
	        var container = L.DomUtil.create('div', 'sheet-control', map.getContainer());
	        var color;
	        if(this._options.maptype=='vec' || this._options.maptype=='ter'){
	        	color = '#000';
	        } else if(this._options.maptype=='img'){
	        	color = '#fff';
	        }
	        container.innerHTML = '<img src="https://api.tianditu.gov.cn/v4.0/image/logo.png" width="53px" height="22px" opacity="0"><div class="sheetNumber" style="position:absolute;bottom:0px;left:58px;white-space:nowrap;color:'+color+';">'+sheetNumber+'</div>';
	        return container;
	    }
	});

	var sheetControl;

	var layerControl = new L.Control({position: 'topright'});

	layerControl.onAdd = function () {
		var layerPop = document.createElement('div');
		layerPop.className = "layer_popup";
		layerPop.innerHTML = '<div class="layer_switch"><i></i></div>'+
							 '<div class="layer_panel inactive">'+
							 '	<i class="close"></i>'+
							 '  <h3>选择底图</h3>'+
							 '  <div class="layer-items">'+
							 '		<a href="javascript:void(0);" id="vec_type"><img src="./images/map/vec.jpg">地图</a>'+
							 '		<a href="javascript:void(0);" id="img_type" style="margin: 0 16px"><img src="./images/map/img.jpg">影像</a>'+
							 '		<a href="javascript:void(0);" id="ter_type"><img src="./images/map/ter.jpg">地形</a>'+
							 '  </div>'+
							 '  <ul>'+
							 '		<li><span>地名</span><i id="cn_name" class="active"></i></li>'
							   '</ul>'+
							 '</div>';
		return layerPop;
	}

	layerControl.onRemove = function (map) {
		//移除控件时要释放
	}

	map.addControl(layerControl);

	// 图例名称
    var legendControl = new L.Control({position: 'bottomright'});

    legendControl.onAdd = function () {
        var legend = document.createElement('div');
        legend.className = "legend_name";
        // legend.innerHTML = '<i></i>天地图访问分布';
        return legend;
    }

    legendControl.onRemove = function (map) {
        //移除控件时要释放
    }

    map.addControl(legendControl);

	var x = 10, y = 10;

	if(option) {
		if(option.x){
			x = option.x;
		}

		if(option.y){
			y = option.y;
		}
	}

	// layerControl.setOffset({x:-x,y:-y});

	var layerPanel = document.querySelector('.layer_panel');
	// 控制底图选择显隐
	var layerSwitch = document.querySelector('.layer_switch');
	layerSwitch.addEventListener('click', function(){
		toggleClass(layerPanel, 'inactive');
	});

	// 关闭底图
	var layerClose = document.querySelector('i.close');
	layerClose.addEventListener('click', function(){
        addClass(layerPanel, 'inactive');
	});

	var mapTypes = document.querySelectorAll('.layer-items a');

	var cnName = document.getElementById('cn_name');

	var cacheLayers = [];

	// 切换底图
	for(var i=0; i<mapTypes.length; i++){
		var mapType = mapTypes[i];
		mapType.addEventListener('click', mapTypeClick.bind(mapType));
	}

    function mapTypeClick(){
        var target = this;

        if(target.className.indexOf('active') > -1){
            return;
        }

        for (var m = 0; m < mapTypes.length; m++) {
            removeClass(mapTypes[m],'active' );
        }

        addClass(target, 'active');

        // 移除前图层
        for (var c = 0; c < cacheLayers.length; c++){
            map.removeLayer(cacheLayers[c]);
        }

        // 清空缓存图层
        cacheLayers = [];

        var id = target.id, mapType;
        if(id.indexOf('vec') == 0) {
            mapType = 'vec';
            // 矢量底图
            var vecLayer = addLayer('vec');
            cacheLayers.push(vecLayer);
            // 矢量注记
            var cvaLayer = addLayer('cva');
            cacheLayers.push(cvaLayer);
        } else if (id.indexOf('img') == 0) {
            mapType = 'img';
            // 影像底图
            var imgLayer = addLayer('img');
            cacheLayers.push(imgLayer);
            // 影像国界
            var iboLayer = addLayer('ibo');
            cacheLayers.push(iboLayer);
            // 影像注记
            var ciaLayer = addLayer('cia');
            cacheLayers.push(ciaLayer);
        } else if (id.indexOf('ter') == 0) {
            mapType = 'ter';
            // 地形底图
            var terLayer = addLayer('ter');
            cacheLayers.push(terLayer);
            // 地形国界
            var tboLayer = addLayer('tbo');
            cacheLayers.push(tboLayer);
            // 地形注记
            var ciaLayer = addLayer('cta');
            cacheLayers.push(ciaLayer);
        }

        if(sheetControl){
            map.removeControl(sheetControl);
        }

        // 添加图幅号
        sheetControl = new SheetControl({position: 'bottomleft', maptype:mapType});

        map.addControl(sheetControl);
    };

	// 切换注记
	cnName.addEventListener('click', function(){
        toggleClass(this, 'active');

		var tagLayer = cacheLayers[cacheLayers.length-1];

		if(this.className.indexOf('active') > -1){
			map.addLayer(tagLayer);
		} else {
			map.removeLayer(tagLayer);
		}
	});

	function addLayer (mapType, check) {
		var mapZoom = 18, layerZoom = 18;
		// 地形
		if (mapType == 'ter') {
			mapZoom = 14;
			layerZoom = 14;
		}

		if (mapType == 'ibo' || mapType == 'tbo') {
			layerZoom = 10;
		}

    	var mapLayer = L.tileLayer.tiandituLayer({layerType:mapType, minZoom:1, maxZoom:layerZoom});

		// 添加新的图层
		var check = cnName.className.indexOf('active') > -1;

		if(mapType.indexOf('c') != 0 || check){
			map.addLayer(mapLayer);

			// 切换底图时保证底图和注记一直在最下面
			if (mapType == 'vec' || mapType == 'img' || mapType == 'ter') {
				mapLayer.setZIndex(-1);
			} else {
				mapLayer.setZIndex(0);
			}
		}

		map.setMinZoom(1);
		map.setMaxZoom(mapZoom);


		return mapLayer;
	}

	function remove() {
		for (var c = 0; c < cacheLayers.length; c++) {
			var layer = cacheLayers[c];
			map.removeLayer(layer);
		}

		document.querySelector('.layer_popup').style.display="none";
	}

	function restore() {
		for (var c = 0; c < cacheLayers.length; c++) {
			var layer = cacheLayers[c];
			map.addLayer(layer);
			layer.setZIndex(c - cacheLayers.length + 1);
		}

		document.querySelector('.layer_popup').style.display="block";
	}

    /**
     * dom元素添加类
     * @param obj
     * @param cls
     */
    function addClass(obj, cls){
        var obj_class = obj.className,//获取 class 内容.
            blank = (obj_class != '') ? ' ' : '';//判断获取到的 class 是否为空, 如果不为空在前面加个'空格'.
        var added = obj_class + blank + cls;//组合原来的 class 和需要添加的 class.
        obj.className = added;//替换原来的 class.
    }

    /**
     * dom元素移除类
     * @param obj
     * @param cls
     */
    function removeClass(obj, cls){
        var obj_class = ' '+obj.className+' ';//获取 class 内容, 并在首尾各加一个空格. ex) 'abc    bcd' -> ' abc    bcd '
        obj_class = obj_class.replace(/(\s+)/gi, ' '),//将多余的空字符替换成一个空格. ex) ' abc    bcd ' -> ' abc bcd '
            removed = obj_class.replace(' '+cls+' ', ' ');//在原来的 class 替换掉首尾加了空格的 class. ex) ' abc bcd ' -> 'bcd '
        var removed = removed.replace(/(^\s+)|(\s+$)/g, '');//去掉首尾空格. ex) 'bcd ' -> 'bcd'
        obj.className = removed;//替换原来的 class.
    }

    function toggleClass(obj, cls){
        if (obj.className.indexOf(cls) > -1){
            obj.className = obj.className.replace(cls, '');
        } else {
            var lastChar = obj.className.substr(-1);
            if (lastChar == ' '){
                obj.className = obj.className + cls;
			} else {
                obj.className = obj.className + ' ' + cls;
			}
        }
	}

    // 叠加默认底图
    mapTypeClick.call(mapTypes[0]);

	this.remove = remove;
	this.restore = restore;
})
