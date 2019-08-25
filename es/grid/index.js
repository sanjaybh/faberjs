"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.computeGridLayout=computeGridLayout;var _utils=require("../utils");var _trackSizing=_interopRequireDefault(require("./track-sizing"));var _constants=require("../utils/constants");var _repeatResolver=require("./helpers/repeatResolver");function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj}}function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);if(enumerableOnly)symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable});keys.push.apply(keys,symbols)}return keys}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?arguments[i]:{};if(i%2){ownKeys(source,true).forEach(function(key){_defineProperty(target,key,source[key])})}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(target,Object.getOwnPropertyDescriptors(source))}else{ownKeys(source).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key))})}}return target}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true})}else{obj[key]=value}return obj}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);return Constructor}var validSizes=["auto","none"],minmaxRegex=/minmax/,templateSplitRegex=/(?:[^\s[\]()]+|\[[^[\]]*\]|\([^()]*\))+/g,getUCFirstString=function getUCFirstString(str){return str.charAt(0).toUpperCase()+str.slice(1)},validNestedGrid=function validNestedGrid(tree){var _ref=tree.style||{},gridTemplateColumns=_ref.gridTemplateColumns,gridTemplateRows=_ref.gridTemplateRows;if(/repeat\(/g.test(gridTemplateColumns)||/repeat\(/g.test(gridTemplateRows)){return false}return true},parseRepeatFunction=function parseRepeatFunction(repeatStr){return repeatStr.split(/\(|\)/g)[1].split(",").map(function(arg){return arg&&arg.trim()})},getCleanSize=function getCleanSize(size){size=size.trim();if(size==="auto")return size;if(!isNaN(+size))return+size;if(minmaxRegex.test(size)){var sizeAr=size.split(/\(|\)/g)[1].split(",");return[sizeAr[0].trim(),sizeAr[1].trim()]}return size},getItemSize=function getItemSize(items,dimension){var filteredItems,templateCol,parsedDim=getUCFirstString(dimension),size,trackDir=dimension==="width"?"col":"row";filteredItems=items.map(function(item){templateCol=item.style["gridTemplate"+getUCFirstString(trackDir==="col"?"columns":"rows")];if((0,_utils.getDisplayProperty)(item)==="grid"&&/repeat\(/g.test(templateCol)){size=parseRepeatFunction(templateCol)[1]}else{size=item.style["min"+parsedDim+"Contribution"]||item.style[dimension]||"auto"}return{start:item[trackDir+"Start"],end:item[trackDir+"End"],size:size}});return filteredItems},updateMatrix=function updateMatrix(grid,start,end){var i,j;for(i=start.x;i<end.x;i++){for(j=start.y;j<end.y;j++){grid[i][j]=true}}},getMaxRowColumn=function getMaxRowColumn(items){var maxRow=1,maxColumn=1;items.forEach(function(item){maxColumn=Math.max(isNaN(+item.style.gridColumnStart)?0:+item.style.gridColumnStart,maxColumn,isNaN(+item.style.gridColumnEnd-1)?0:+item.style.gridColumnEnd-1);maxRow=Math.max(isNaN(+item.style.gridRowStart)?0:+item.style.gridRowStart,maxRow,isNaN(+item.style.gridRowEnd-1)?0:+item.style.gridRowEnd-1)});return{maxRow:maxRow,maxColumn:maxColumn}};var Grid=function(){function Grid(){_classCallCheck(this,Grid);this.setup()}_createClass(Grid,[{key:"setup",value:function setup(){this._tsa=new _trackSizing["default"];this.props={};this._config={mapping:{}};return this}},{key:"set",value:function set(key,value){this.props[key]=value;return this}},{key:"getProps",value:function getProps(key){return this.props[key]}},{key:"getConfig",value:function getConfig(key){return this._config[key]}},{key:"compute",value:function compute(_domTree){var domTree=_domTree||this.props.domTree;this._sanitizeTracks(domTree)._sanitizeItems(domTree)._inflateTracks()._assignCoordinatesToCells(domTree)}},{key:"_sanitizeTracks",value:function _sanitizeTracks(){var _domTree=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var style=_domTree.style,gridTemplateRows=style.gridTemplateRows,gridTemplateColumns=style.gridTemplateColumns,config=this._config,trackInfo,_getMaxRowColumn=getMaxRowColumn(_domTree.children),maxColumn=_getMaxRowColumn.maxColumn,maxRow=_getMaxRowColumn.maxRow;this.set("maxTracks",maxRow);trackInfo=this._fetchTrackInformation(gridTemplateRows);config.mapping.row={nameToLineMap:trackInfo.nameToLineMap,lineToNameMap:trackInfo.lineToNameMap};config.rowTracks=trackInfo.tracks;this.set("maxTracks",maxColumn);trackInfo=this._fetchTrackInformation(gridTemplateColumns);config.mapping.col={nameToLineMap:trackInfo.nameToLineMap,lineToNameMap:trackInfo.lineToNameMap};config.colTracks=trackInfo.tracks;return this}},{key:"_fetchTrackInformation",value:function _fetchTrackInformation(){var tracks=arguments.length>0&&arguments[0]!==undefined?arguments[0]:"none";var i,len,splittedTrackInfo=tracks.match(templateSplitRegex),nameList,sizeList,sanitizedTracks=[{}],startLineNames,endLineNames,nameToLineMap={},lineToNameMap={};nameList=splittedTrackInfo.filter(function(track){if(track&&typeof track==="string"&&track.length){len=track.length;if(track[0]==="["&&track[len-1]==="]"){return true}return false}return true});sizeList=splittedTrackInfo.filter(function(size){if(!size)return false;len=(size+"").toLowerCase().replace(/px|fr/,"");if(validSizes.indexOf(len)>=0||minmaxRegex.test(len)||!isNaN(len)){return true}return false}).map(function(size){return getCleanSize(size)});len=sizeList.length;if(tracks==="none"){len=this.getProps("maxTracks")}for(i=0;i<len;i++){startLineNames=nameList[i]&&nameList[i].replace(/\[|\]/g,"").split(" ").filter(function(name){return name.length}).map(function(name){return name.trim()})||[i+1+""];endLineNames=nameList[i+1]&&nameList[i+1].replace(/\[|\]/g,"").split(" ").filter(function(name){return name.length}).map(function(name){return name.trim()})||[i+2+""];sanitizedTracks.push({start:i+1,end:i+2,size:sizeList[i]||"auto"});lineToNameMap[i+1]=startLineNames;lineToNameMap[i+2]=endLineNames;startLineNames.forEach(function(name){return nameToLineMap[name]=i+1});endLineNames.forEach(function(name){return nameToLineMap[name]=i+2});nameToLineMap[i+1]=i+1;nameToLineMap[i+2]=i+2}return{tracks:sanitizedTracks,nameToLineMap:nameToLineMap,lineToNameMap:lineToNameMap}}},{key:"_sanitizeItems",value:function _sanitizeItems(_domTree){var domTree=_domTree||this.props.domTree,items=domTree.children||[],mapping=this._config.mapping,gridAutoFlow=domTree.style.gridAutoFlow||"row",rowNum=Object.keys(mapping.row.lineToNameMap).length,colNum=Object.keys(mapping.col.lineToNameMap).length,sanitizedItems=[],autoFlowItems=[],itemStyle,gridMatrix=[[]],freeCells=[],cell,item,extraRows,i,j,len;for(i=1;i<=rowNum;i++){gridMatrix.push([])}for(i=0,len=items.length;i<len;i++){itemStyle=items[i].style;sanitizedItems.push(_objectSpread({},items[i],{rowStart:mapping.row.nameToLineMap[itemStyle.gridRowStart],rowEnd:mapping.row.nameToLineMap[itemStyle.gridRowEnd],colStart:mapping.col.nameToLineMap[itemStyle.gridColumnStart],colEnd:mapping.col.nameToLineMap[itemStyle.gridColumnEnd]}));item=sanitizedItems[i];updateMatrix(gridMatrix,{x:item.colStart,y:item.rowStart},{x:item.colEnd,y:item.rowEnd})}autoFlowItems=sanitizedItems.filter(function(sanitizedItem){return!sanitizedItem.colStart||!sanitizedItem.rowStart});if(autoFlowItems){if(gridAutoFlow==="row"){for(i=1;i<rowNum;i++){for(j=1;j<colNum;j++){if(!gridMatrix[i][j]){freeCells.push({row:i,col:j})}}}while(autoFlowItems.length&&freeCells.length){item=autoFlowItems.shift();cell=freeCells.shift();item.rowStart=cell.row;item.colStart=cell.col;item.rowEnd=cell.row+1;item.colEnd=cell.col+1}extraRows=Math.ceil(autoFlowItems.length/colNum);if(extraRows){while(extraRows--){domTree.style.gridTemplateRows+="auto ";mapping.row.nameToLineMap[rowNum+1]=rowNum+1;mapping.row.nameToLineMap[rowNum+2]=rowNum+2;rowNum++;gridMatrix.push([])}domTree.style.gridTemplateRows=domTree.style.gridTemplateRows.trim();freeCells=[];for(i=1;i<=rowNum;i++){for(j=1;j<=colNum;j++){if(!gridMatrix[i][j]){freeCells.push({row:i,col:j})}}}while(autoFlowItems.length){item=autoFlowItems.shift();cell=freeCells.shift();item.rowStart=cell.row;item.colStart=cell.col;item.rowEnd=cell.row+1;item.colEnd=cell.col+1}}}}this._config.sanitizedItems=sanitizedItems;return this}},{key:"_inflateTracks",value:function _inflateTracks(){var _this$_config=this._config,sanitizedItems=_this$_config.sanitizedItems,colTracks=_this$_config.colTracks,rowTracks=_this$_config.rowTracks,sizedTracks,minHeightContribution=0,minWidthContribution=0,domTree=this.props.domTree,_ref2=domTree.style||{},paddingStart=_ref2.paddingStart,paddingEnd=_ref2.paddingEnd,paddingTop=_ref2.paddingTop,paddingBottom=_ref2.paddingBottom,width=_ref2.width,height=_ref2.height,tsa=new _trackSizing["default"];if(!isNaN(+width)){width-=paddingStart+paddingEnd}sizedTracks=tsa.clear().set("tracks",colTracks).set("items",getItemSize(sanitizedItems,"width")).set("containerSize",width||"auto").resolveTracks();colTracks.forEach(function(track,index){track.calculatedStyle=sizedTracks[index];minWidthContribution+=sizedTracks[index].baseSize||0});this._solveUnresolvedChildren();if(!isNaN(+height)){height-=paddingTop+paddingBottom}sizedTracks=tsa.clear().set("tracks",rowTracks).set("items",getItemSize(sanitizedItems,"height")).set("containerSize",height||"auto").resolveTracks();rowTracks.forEach(function(track,index){track.calculatedStyle=sizedTracks[index];minHeightContribution+=sizedTracks[index].baseSize||0});domTree.style.minHeightContribution=minHeightContribution;domTree.style.minWidthContribution=minWidthContribution;return this}},{key:"_solveUnresolvedChildren",value:function _solveUnresolvedChildren(_domTree){var domTree=_domTree||this.props.domTree,childrenWithRepeatConfiguration=(domTree.unResolvedChildren||[]).filter(function(child){return /repeat\(/g.test(child.style.gridTemplateColumns)||/repeat\(/g.test(child.style.gridTemplateRows)}),_this$_config2=this._config,colTracks=_this$_config2.colTracks,mapping=_this$_config2.mapping,parentReference=this.getProps("parent"),colTrackDp=[0],resolvedTracks,i,len,trackWidth,parentInfo,parsedWidthOfItem,colStart,colEnd;if(!childrenWithRepeatConfiguration.length){return this}for(i=1,len=colTracks.length;i<len;i++){colTrackDp[i]=colTrackDp[i-1]+colTracks[i].calculatedStyle.baseSize}childrenWithRepeatConfiguration.forEach(function(child){parsedWidthOfItem=parseRepeatFunction(child.style.gridTemplateColumns)[1];colStart=mapping.col.nameToLineMap[child.style.gridColumnStart];colEnd=mapping.col.nameToLineMap[child.style.gridColumnEnd];trackWidth=colTrackDp[colEnd-1]-colTrackDp[colStart-1];parentInfo={itemWidth:parsedWidthOfItem,width:trackWidth};resolvedTracks=(0,_repeatResolver.repeatResolver)(child,parentInfo);child.style.gridTemplateColumns=resolvedTracks.gridTemplateColumns;child.style.gridTemplateRows=resolvedTracks.gridTemplateRows;parentReference.gridLayoutEngine(child)});return this}},{key:"_assignCoordinatesToCells",value:function _assignCoordinatesToCells(_domTree){var domTree=_domTree||this.props.domTree,_this$_config3=this._config,sanitizedItems=_this$_config3.sanitizedItems,rowTracks=_this$_config3.rowTracks,colTracks=_this$_config3.colTracks,item,len,i,_domTree$style=domTree.style,justifyItems=_domTree$style.justifyItems,alignItems=_domTree$style.alignItems,paddingStart=_domTree$style.paddingStart,paddingTop=_domTree$style.paddingTop,trackWidth,trackHeight,width,height,x,y,rowTrackdp=[paddingStart],colTrackdp=[paddingTop];for(i=1,len=rowTracks.length;i<len;i++){rowTrackdp[i]=rowTrackdp[i-1]+rowTracks[i].calculatedStyle.baseSize}for(i=1,len=colTracks.length;i<len;i++){colTrackdp[i]=colTrackdp[i-1]+colTracks[i].calculatedStyle.baseSize}domTree.layout={x:0,y:0,width:isNaN(domTree.style.width)?colTrackdp[colTrackdp.length-1]:domTree.style.width,height:isNaN(domTree.style.height)?rowTrackdp[rowTrackdp.length-1]:domTree.style.height};(domTree.children||[]).forEach(function(child,index){item=sanitizedItems[index];trackWidth=colTrackdp[item.colEnd-1]-colTrackdp[item.colStart-1];trackHeight=rowTrackdp[item.rowEnd-1]-rowTrackdp[item.rowStart-1];width=isNaN(+child.style.width)?trackWidth:+child.style.width;height=isNaN(+child.style.height)?trackHeight:+child.style.height;switch(justifyItems||child.style.justifySelf){case _constants.CENTER:x=colTrackdp[item.colStart-1]+trackWidth/2-width/2;break;case _constants.END:x=colTrackdp[item.colEnd-1]-width;break;case _constants.STRETCH:width=trackWidth;x=colTrackdp[item.colStart-1];break;default:x=colTrackdp[item.colStart-1];}switch(alignItems||child.style.alignSelf){case _constants.CENTER:y=rowTrackdp[item.rowStart-1]+trackHeight/2-height/2;break;case _constants.END:y=rowTrackdp[item.rowEnd-1]-height;break;case _constants.STRETCH:height=trackHeight;y=rowTrackdp[item.rowStart-1];break;default:y=rowTrackdp[item.rowStart-1];}x+=(0,_utils.pluckNumber)(item.style.paddingStart,item.style.padding,0);y+=(0,_utils.pluckNumber)(item.style.paddingTop,item.style.padding,0);child.layout={x:x,y:y,x2:x+width,y2:y+height,width:width,height:height}});return this}}]);return Grid}();var replaceWithAbsValue=function replaceWithAbsValue(){var styleTrack=arguments.length>0&&arguments[0]!==undefined?arguments[0]:"";var calculatedTrack=arguments.length>1?arguments[1]:undefined;var trackSplitAr=(styleTrack.match(templateSplitRegex)||[]).filter(function(track){return track&&!!track.trim()}),trackWithAbsValue="",counter=1;if(trackSplitAr.length&&!/repeat\(/.test(styleTrack)){trackSplitAr.forEach(function(track){if(validSizes.indexOf(track)>-1||/[0-9]fr/.test(track)||minmaxRegex.test(track)||!isNaN(track)){trackWithAbsValue+=calculatedTrack[counter].calculatedStyle.baseSize+" ";counter++}else{trackWithAbsValue+=track+" "}})}else{calculatedTrack.forEach(function(track){if(isNaN(track.calculatedStyle.baseSize))return;trackWithAbsValue+=track.calculatedStyle.baseSize+" "})}return trackWithAbsValue.trim()},updateDomTreeWithResolvedValues=function updateDomTreeWithResolvedValues(domTree,grid){var containerStyle=domTree.style,rowTracks=grid.getConfig("rowTracks"),colTracks=grid.getConfig("colTracks"),mapping=grid.getConfig("mapping"),gridTemplateRows=containerStyle.gridTemplateRows,gridTemplateColumns=containerStyle.gridTemplateColumns,child,i,j,len,rowTrackSum,colTrackSum,rowStart,rowEnd,colStart,colEnd;domTree.style.gridTemplateRows=replaceWithAbsValue(gridTemplateRows,rowTracks);domTree.style.gridTemplateColumns=replaceWithAbsValue(gridTemplateColumns,colTracks);for(i=0,len=(domTree.children||[]).length;i<len;i++){child=domTree.children[i];if((0,_utils.getDisplayProperty)(child)){child.style.gridTemplateColumns=child.userGivenStyles.gridTemplateColumns;child.style.gridTemplateRows=child.userGivenStyles.gridTemplateRows;if(isNaN(child.userGivenStyles.width)){colStart=child.style.gridColumnStart;colEnd=child.style.gridColumnEnd;colStart=mapping.col.nameToLineMap[colStart];colEnd=mapping.col.nameToLineMap[colEnd];for(j=colStart,colTrackSum=0;j<colEnd;j++){colTrackSum+=colTracks[j].calculatedStyle.baseSize}child.style.width=colTrackSum}if(isNaN(child.userGivenStyles.height)){rowStart=child.style.gridRowStart;rowEnd=child.style.gridRowEnd;rowStart=mapping.row.nameToLineMap[rowStart];rowEnd=mapping.row.nameToLineMap[rowEnd];for(j=rowStart,rowTrackSum=0;j<rowEnd;j++){rowTrackSum+=rowTracks[j].calculatedStyle.baseSize}child.style.height=rowTrackSum}}}return domTree};function computeGridLayout(domTree){var count=arguments.length>1&&arguments[1]!==undefined?arguments[1]:1;var i,len,style=domTree.style,child,grid;if(!domTree||!domTree.style){return}if(!domTree.userGivenStyles){domTree.style.width=isNaN(domTree.style.width)?"auto":domTree.style.width;domTree.style.height=isNaN(domTree.style.height)?"auto":domTree.style.height;style.paddingStart=(0,_utils.pluckNumber)(style.paddingStart,style.padding,0);style.paddingEnd=(0,_utils.pluckNumber)(style.paddingEnd,style.padding,0);style.paddingTop=(0,_utils.pluckNumber)(style.paddingTop,style.padding,0);style.paddingBottom=(0,_utils.pluckNumber)(style.paddingBottom,style.padding,0);domTree.userGivenStyles={gridTemplateColumns:domTree.style.gridTemplateColumns,gridTemplateRows:domTree.style.gridTemplateRows,width:domTree.style.width,height:domTree.style.height}}domTree.unResolvedChildren=[];for(i=0,len=domTree.children&&domTree.children.length;i<len;i++){child=domTree.children[i];if((0,_utils.getDisplayProperty)(child)){if(validNestedGrid(child)){this.compute(child)}else{domTree.unResolvedChildren.push(child)}}}grid=new Grid;grid.set("domTree",domTree).set("parent",this).compute();if(count<2){this.gridLayoutEngine(updateDomTreeWithResolvedValues(domTree,grid),2)}return domTree}