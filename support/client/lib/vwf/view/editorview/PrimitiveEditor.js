define(function() {
    var PrimEditor = {};
    var isInitialized = false;
    return {
        getSingleton: function() {
            if (!isInitialized) {
                
               
                var baseclass = require("vwf/view/editorview/panelEditor");
                //var base = new baseclass('hierarchyManager','Hierarchy','hierarchy',false,true,'#sidepanel')
                //base.init();
                //$.extend(HierarchyManager,base);
                baseclass(PrimEditor,'PrimitiveEditor','Properties','properties',true,true,'#sidepanel')
                
                PrimEditor.init()
                initialize.call(PrimEditor);
                PrimEditor.bind()
                isInitialized = true;

               
            }
            return PrimEditor;
        }
    }

    function initialize() {

        this.propertyEditorDialogs = [];
        this.currentWidgets = {};
        function hasPrototype(nodeID, prototype) {
	        if (!nodeID) return false;
	        if (nodeID == prototype) return true;
	        else return hasPrototype(vwf.prototype(nodeID), prototype);
	    }

	    function isBehavior(id) {
	        return hasPrototype(id, 'http-vwf-example-com-behavior-vwf');
	    }


        $('#' + this.contentID).append(
            '<div id="accordion" style="height:100%;overflow:hidden">' +
            '<h3><a href="#">Flags</a></h3>' +
            '<div>' +
            "<div id='otherprops'>" +
            "<input class='' style='width:50%;text-align: center;vertical-align: middle;' type='text' id='dispName'>Name</input><br/>" +
            "<input disabled='disabled' class='' style='width:50%;text-align: center;vertical-align: middle;' type='text' id='dispOwner'>Owners</input><br/>" +

            "<input class='editorCheck' type='checkbox' id='isVisible'>Visible</input><br/>" +
            "<input class='editorCheck' type='checkbox' id='isStatic'>Static (does not move)</input><br/>" +
            "<input class='editorCheck' type='checkbox' id='isDynamic'>Dynamic (moves frequently)</input><br/>" +
            "<input class='editorCheck' type='checkbox' id='castShadows'>Cast Shadows</input><br/>" +
            "<input class='editorCheck'type='checkbox' id='receiveShadows'>Receive Shadows</input><br/>" +
            "<input class='editorCheck' type='checkbox' id='passable'>Passable (collides with avatars)</input><br/>" +
            "<input class='editorCheck' type='checkbox' id='isSelectable'>Selectable (visible to pick)</input><br/>" +
            "<input class='editorCheck' type='checkbox' id='inheritScale'>Inherit Parent Scale</input><br/>" +
            "</div>" +
            '</div>' +
            '<h3><a href="#">Transforms</a></h3>' +
            '<div>' +
            "<div class='EditorLabel'>Translation</div>" +
            "<div id='Translation'>" +
            "<input   class='TransformEditorInput' id='PositionX'/>" +
            "<input   class='TransformEditorInput' id='PositionY'/>" +
            "<input   class='TransformEditorInput' id='PositionZ'/>" +
            "</div>" + "<div class='EditorLabel'>Rotation</div>" +
            "<div id='Rotation'>" +
            "<input  class='TransformEditorInput' id='RotationX'/>" +
            "<input  class='TransformEditorInput' id='RotationY'/>" +
            "<input  class='TransformEditorInput' id='RotationZ'/>" +
            "<input  class='TransformEditorInput' id='RotationW'/>" +
            "</div>" +
            "<div class='EditorLabel'>Scale</div>" +
            "<div id='Scale'>" +
            "<input  min='.0001' step='.05'  class='TransformEditorInput' id='ScaleX'/>" +
            "<input  min='.0001' step='.05' class='TransformEditorInput' id='ScaleY'/>" +
            "<input  min='.0001' step='.05' class='TransformEditorInput' id='ScaleZ'/>" +
            "</div>" +
            '</div>' +
            '</div>');
        
        
        
       
        $('.TransformEditorInput').spinner();
        $('#isStatic').change(function(e) {
            _PrimitiveEditor.setProperty('selection', 'isStatic', this.checked)
        });
        $('#inheritScale').change(function(e) {
            _PrimitiveEditor.setProperty('selection', 'inheritScale', this.checked)
        });
        $('#isVisible').change(function(e) {
            _PrimitiveEditor.setProperty('selection', 'visible', this.checked)
        });
        $('#isDynamic').change(function(e) {
            _PrimitiveEditor.setProperty('selection', 'isDynamic', this.checked)
        });
        $('#castShadows').change(function(e) {
            _PrimitiveEditor.setProperty('selection', 'castShadows', this.checked)
        });
        $('#isSelectable').change(function(e) {
            _PrimitiveEditor.setProperty('selection', 'isSelectable', this.checked)
        });
        $('#receiveShadows').change(function(e) {
            _PrimitiveEditor.setProperty('selection', 'receiveShadows', this.checked)
        });
        $('#passable').change(function(e) {
            _PrimitiveEditor.setProperty('selection', 'passable', this.checked)
        });
        $('#dispName').blur(function(e) {
            if (vwf.getProperty(_Editor.GetSelectedVWFNode().id, 'DisplayName') === undefined) {
                vwf.createProperty(_Editor.GetSelectedVWFNode().id, 'DisplayName', $(this).val());
            }
            _PrimitiveEditor.setProperty(_Editor.GetSelectedVWFNode().id, 'DisplayName', $(this).val());
        });
        
        $("#accordion").accordion({
            fillSpace: true,
            heightStyle: "content",
            change: function() {
                if ($('#sidepanel').data('jsp')) $('#sidepanel').data('jsp').reinitialise();
            }
        });
        $(".ui-accordion-content").css('height', 'auto');
       
        this.setProperty = function(id, prop, val, skipUndo) {
            //prevent the handlers from firing setproperties when the GUI is first setup;
            if (this.inSetup) return;

            if (document.PlayerNumber == null) {
                _Notifier.notify('You must log in to participate');
                return;
            }
            if (id != 'selection') {
                if (_PermissionsManager.getPermission(_UserManager.GetCurrentUserName(), id) == 0) {
                    _Notifier.notify('You do not have permission to edit this object');
                    return;
                }
                if (!skipUndo)
                    _UndoManager.recordSetProperty(id, prop, val);
                vwf_view.kernel.setProperty(id, prop, val)
            }
            if (id == 'selection') {
                var undoEvent = new _UndoManager.CompoundEvent();

                for (var k = 0; k < _Editor.getSelectionCount(); k++) {
                    if (_PermissionsManager.getPermission(_UserManager.GetCurrentUserName(), _Editor.GetSelectedVWFNode(k).id) == 0) {
                        _Notifier.notify('You do not have permission to edit this object');
                        continue;
                    }

                    undoEvent.push(new _UndoManager.SetPropertyEvent(_Editor.GetSelectedVWFNode(k).id, prop, val));
                    vwf_view.kernel.setProperty(_Editor.GetSelectedVWFNode(k).id, prop, val)
                }
                if (!skipUndo)
                    _UndoManager.pushEvent(undoEvent);
            }
        }

        this.callMethod = function(id, method) {
            if (document.PlayerNumber == null) {
                _Notifier.notify('You must log in to participate');
                return;
            }
            if (id != 'selection') {
                if (_PermissionsManager.getPermission(_UserManager.GetCurrentUserName(), id) == 0) {
                    _Notifier.notify('You do not have permission to edit this object');
                    return;
                }
                vwf_view.kernel.callMethod(id, method);
            }
            if (id == 'selection') {
                alertify.alert('calling methods on multiple selections is not supported');
            }
        }
        this.BuildGUI = function()
        {
           
            var node = _Editor.getNode(this.selectedID);
            if(!node) return;

            this.currentWidgets = {};
            this.inSetup = true;
            this.clearPropertyEditorDialogs();
            var lastTab = 0;
            try{
                lastTab = $("#accordion").accordion('option', 'active');
                $("#accordion").accordion('destroy');
            }catch(e)
            {
                //accordion was not init yet
            }
            
            $("#accordion").children('.modifiersection').remove();
            //update to ensure freshness
           
            node.properties = vwf.getProperties(node.id);
            if (!node.properties) return;



            $('#ui-dialog-title-ObjectProperties').text(vwf.getProperty(node.id, 'DisplayName') + " Properties");
            $('#dispName').val(vwf.getProperty(node.id, 'DisplayName') || node.id);

            this.addPropertyEditorDialog(node.id, 'DisplayName', $('#dispName'), 'text');

            

            if ($('#dispName').val() == "") {
                $('#dispName').val(node.name);
            }
            $('#dispOwner').val(vwf.getProperty(node.id, 'owner'));

            if (vwf.getProperty(node.id, 'isStatic')) {
                $('#isStatic').prop('checked', 'checked');
            } else {
                $('#isStatic').prop('checked', '');
            }

            if (vwf.getProperty(node.id, 'visible')) {
                $('#isVisible').prop('checked', 'checked');
            } else {
                $('#isVisible').prop('checked', '');
            }

            if (vwf.getProperty(node.id, 'inheritScale')) {
                $('#inheritScale').prop('checked', 'checked');
            } else {
                $('#inheritScale').prop('checked', '');
            }

            if (vwf.getProperty(node.id, 'isDynamic')) {
                $('#isDynamic').prop('checked', 'checked');
            } else {
                $('#isDynamic').prop('checked', '');
            }
            if (vwf.getProperty(node.id, 'castShadows')) {
                $('#castShadows').prop('checked', 'checked');
            } else {
                $('#castShadows').prop('checked', '');
            }
            if (vwf.getProperty(node.id, 'isSelectable')) {
                $('#isSelectable').prop('checked', 'checked');
            } else {
                $('#isSelectable').prop('checked', '');
            }
            if (vwf.getProperty(node.id, 'passable')) {
                $('#passable').prop('checked', 'checked');
            } else {
                $('#passable').prop('checked', '');
            }
            if (vwf.getProperty(node.id, 'receiveShadows')) {
                $('#receiveShadows').prop('checked', 'checked');
            } else {
                $('#receiveShadows').prop('checked', '');
            }
            $('#BaseSectionTitle').text(node.properties.type || "Type" + ": " + node.id);
            this.SelectionTransformed(null, node);
            this.setupAnimationGUI(node, true);
            this.setupEditorData(node,node.id, true,vwf.getProperty(node.id, 'EditorData'));
            this.recursevlyAddPrototypes(node);
            this.recursevlyAddModifiers(node);
            this.addBehaviors(node);
            $("#accordion").accordion({
                heightStyle: 'fill',
                activate: function() {
                    if ($('#sidepanel').data('jsp')) $('#sidepanel').data('jsp').reinitialise();
                }
            });
            $(".ui-accordion-content").css('height', 'auto');
            this.inSetup = false;

            $("#accordion").accordion({
                'active': lastTab
            });
        }
        this.recursevlyAddPrototypes = function(node) {
            
            
            var oldID = node.id;
            node = _Editor.getNode(vwf.prototype(node.id)); 
             if(!node){
                return;  
            }
            var currentID = node.id;
            //must be careful... we don't actually want to set the properties on the prototype
            //we want to set them on the current node
            node.id = oldID;

            this.setupEditorData(node,currentID, false,vwf.getProperty(currentID, 'EditorData'));
            node.id = currentID; // careful not to recurse forever
            this.recursevlyAddPrototypes(node);
                
            
        }
        this.recursevlyAddModifiers = function(node) {
            for (var i in node.children) {
                /*	section = '<h3 class="modifiersection" ><a href="#">'+node.children[i].properties.type+'</a></h3>'+
			'<div class="modifiersection">'+
			'<div class="EditorLabel">Amount</div>' +
					'<div id="'+node.children[i].id+'Amount" nodename="'+node.children[i].id+'">'
			'</div>';
			$( "#accordion" ).append(section);
			//$("#Radius").slider({min:0,max:10,step:.10,slide:this.updateSize.bind(this)});
			$("#"+node.children[i].id+"Amount").slider({min:-1,max:1,step:.10,slide:this.modifierAmountUpdate,stop:this.modifierAmountUpdate});
			//$("#"+node.children[i].id+"Amount").slider('value',vwf.getProperty(node.children[i].id,'amount'));
			*/
                if (vwf.getProperty(node.children[i].id, 'isModifier') == true) {
                    this.setupEditorData(node.children[i],node.children[i].id, false,vwf.getProperty(node.children[i].id, 'EditorData'));
                    this.recursevlyAddModifiers(node.children[i]);
                }
            }
        }
        this.addBehaviors = function(node) {
            for (var i in node.children) {
                /*	section = '<h3 class="modifiersection" ><a href="#">'+node.children[i].properties.type+'</a></h3>'+
			'<div class="modifiersection">'+
			'<div class="EditorLabel">Amount</div>' +
					'<div id="'+node.children[i].id+'Amount" nodename="'+node.children[i].id+'">'
			'</div>';
			$( "#accordion" ).append(section);
			//$("#Radius").slider({min:0,max:10,step:.10,slide:this.updateSize.bind(this)});
			$("#"+node.children[i].id+"Amount").slider({min:-1,max:1,step:.10,slide:this.modifierAmountUpdate,stop:this.modifierAmountUpdate});
			//$("#"+node.children[i].id+"Amount").slider('value',vwf.getProperty(node.children[i].id,'amount'));
			*/
                if (isBehavior(node.children[i].id)) {
                    this.setupEditorData(node.children[i],node.children[i].id, false,vwf.getProperty(node.children[i].id, 'EditorData'));
                }
            }
        }
        this.primPropertySlide = function(e, ui) {

            var id = $(this).attr('nodename');
            var prop = $(this).attr('propname');
            $('#' + id + prop + 'value').val(ui.value);
            var amount = ui.value;
            //be sure to skip undo - handled better in slidestart and slidestop
            _PrimitiveEditor.setProperty(id, prop, parseFloat(amount), true);

        }
        this.primPropertySlideStart = function(e, ui) {
            var id = $(this).attr('nodename');
            var prop = $(this).attr('propname');
            $('#' + id + prop + 'value').val(ui.value);
            var amount = ui.value;
            this.undoEvent = new _UndoManager.CompoundEvent();
            if (id == 'selection') {
                for (var i = 0; i < _Editor.getSelectionCount(); i++)
                    this.undoEvent.push(new _UndoManager.SetPropertyEvent(_Editor.GetSelectedVWFNode(i).id, prop, null))
            } else {
                this.undoEvent.push(new _UndoManager.SetPropertyEvent(id, prop, null))
            }
            _PrimitiveEditor.setProperty(id, prop, parseFloat(amount), true);
        }
        this.primPropertySlideStop = function(e, ui) {
            var id = $(this).attr('nodename');
            var prop = $(this).attr('propname');
            $('#' + id + prop + 'value').val(ui.value);
            var amount = ui.value;

            if (this.undoEvent)
                for (var i = 0; i < this.undoEvent.list.length; i++)
                    this.undoEvent.list[i].val = amount;
            _UndoManager.pushEvent(this.undoEvent);
            this.undoEvent = null;

            _PrimitiveEditor.setProperty(id, prop, parseFloat(amount), true);
        }
        this.primPropertyUpdate = function(e, ui) {
            var id = $(this).attr('nodename');
            var prop = $(this).attr('propname');
            $('#' + id + prop + 'value').val(ui.value);
            var amount = ui.value;
            _PrimitiveEditor.setProperty(id, prop, parseFloat(amount));
        }
        this.primPropertyTypein = function(e, ui) {
            var id = $(this).attr('nodename');
            var prop = $(this).attr('propname');
            var amount = $(this).val();
            var slider = $(this).attr('slider');
            $(slider).slider('value', amount);
            _PrimitiveEditor.setProperty(id, prop, parseFloat(amount));
        }
        this.primSpinner = function(e, ui) {
            var id = $(this).attr('nodename');
            var prop = $(this).attr('propname');
            var amount = $(this).val();
            var slider = $(this).attr('slider');
            $(slider).slider('value', ui.value);
            _PrimitiveEditor.setProperty(id, prop, parseFloat(ui.value));

        }
        this.primPropertyValue = function(e, ui) {
            var id = $(this).attr('nodename');
            var prop = $(this).attr('propname');
            var val = $(this).attr('value');
            _PrimitiveEditor.setProperty(id, prop, val);
        }
        this.primPropertyChecked = function(e, ui) {
            var id = $(this).attr('nodename');
            var prop = $(this).attr('propname');
            if ($(this).is(':checked')) _PrimitiveEditor.setProperty(id, prop, true);
            else _PrimitiveEditor.setProperty(id, prop, false);
        }
        this.setupAnimationGUI = function(node, wholeselection) {

            var animationLength = vwf.getProperty(node.id, 'animationLength');
            if (animationLength > 0) {

                var animationStart = vwf.getProperty(node.id, 'animationStart');
                var animationEnd = vwf.getProperty(node.id, 'animationEnd');
                var animationFrame = vwf.getProperty(node.id, 'animationFrame');
                var animationSpeed = vwf.getProperty(node.id, 'animationSpeed');
                var nodeid = node.id;
                var section = '<h3 class="modifiersection" ><a href="#"><div style="font-weight:bold;display:inline"> </div>Animation</a></h3><div class="modifiersection" id="animationSettings' + nodeid + '">' + '</div>';
                $("#accordion").append(section);
                $('#animationSettings' + nodeid).append('<div id="animationFrame">');
                var inputstyle = "";
                $('#animationSettings' + nodeid).append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">' + 'animationFrame' + ': </div>');
                $('#animationSettings' + nodeid).append('<input class="primeditorinputbox" style="' + inputstyle + '" type="number" id="' + nodeid + 'animationFrame' + 'value"></input>');
                $('#' + nodeid + 'animationFrame' + 'value').val(vwf.getProperty(node.id, 'animationFrame'));
                $('#' + nodeid + 'animationFrame' + 'value').change(this.primPropertyTypein);
                $('#' + nodeid + 'animationFrame' + 'value').attr("nodename", nodeid);
                $('#' + nodeid + 'animationFrame' + 'value').attr("propname", 'animationFrame');
                $('#' + nodeid + 'animationFrame' + 'value').attr("slider", '#' + nodeid + 'animationFrame');
                $('#animationSettings' + nodeid).append('<div id="' + nodeid + 'animationFrame' + '" nodename="' + nodeid + '" propname="' + 'animationFrame' + '"/>');
                var val = vwf.getProperty(node.id, 'animationFrame');
                if (val == undefined) val = 0;
                $('#' + nodeid + 'animationFrame').slider({
                    step: .01,
                    min: parseFloat(0),
                    max: parseFloat(animationLength),
                    slide: this.primPropertyUpdate,
                    stop: this.primPropertyUpdate,
                    value: val
                });

                this.addPropertyEditorDialog(node.id, 'animationFrame', $('#' + nodeid + 'animationFrame'), 'slider');
                this.addPropertyEditorDialog(node.id, 'animationFrame', $('#' + nodeid + 'animationFrame' + 'value'), 'text');

                $('#animationSettings' + nodeid).append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">' + 'Animation Cycle' + ': </div>');
                $('#animationSettings' + nodeid).append('<div style="display: block;margin: 5px;" id="' + nodeid + i + '" nodename="' + nodeid + '" propnamemax="' + 'animationEnd' + '" propnamemin="' + 'animationStart' + '"/>');

                var minval = animationStart;
                var maxval = animationEnd;
                var val = [minval, maxval]
                $('#' + nodeid + i).slider({
                    range: true,
                    step: parseFloat(.1),
                    min: 0,
                    max: animationLength,
                    values: val,
                    slide: function(e, ui) {
                        var propmin = $(this).attr('propnamemin');
                        var propmax = $(this).attr('propnamemax');
                        var nodeid = $(this).attr('nodename');
                        _PrimitiveEditor.setProperty(nodeid, propmin, parseFloat(ui.values[0]));
                        _PrimitiveEditor.setProperty(nodeid, propmax, parseFloat(ui.values[1]));
                    },
                    stop: function(e, ui) {
                        var propmin = $(this).attr('propnamemin');
                        var propmax = $(this).attr('propnamemax');
                        var nodeid = $(this).attr('nodename');
                        _PrimitiveEditor.setProperty(nodeid, propmin, parseFloat(ui.values[0]));
                        _PrimitiveEditor.setProperty(nodeid, propmax, parseFloat(ui.values[1]));
                    }
                });

                $('#animationSettings' + nodeid).append('<div id="animationSpeed">');
                var inputstyle = "";
                $('#animationSettings' + nodeid).append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">' + 'animationSpeed' + ': </div>');
                $('#animationSettings' + nodeid).append('<input class="primeditorinputbox" style="' + inputstyle + '" type="number" id="' + nodeid + 'animationSpeed' + 'value"></input>');
                $('#' + nodeid + 'animationSpeed' + 'value').val(vwf.getProperty(node.id, 'animationSpeed'));
                $('#' + nodeid + 'animationSpeed' + 'value').change(this.primPropertyTypein);
                $('#' + nodeid + 'animationSpeed' + 'value').attr("nodename", nodeid);
                $('#' + nodeid + 'animationSpeed' + 'value').attr("propname", 'animationSpeed');
                $('#' + nodeid + 'animationSpeed' + 'value').attr("slider", '#' + nodeid + 'animationSpeed');
                $('#animationSettings' + nodeid).append('<div id="' + nodeid + 'animationSpeed' + '" nodename="' + nodeid + '" propname="' + 'animationSpeed' + '"/>');
                var val = vwf.getProperty(node.id, 'animationSpeed');
                if (val == undefined) val = 0;
                $('#' + nodeid + 'animationSpeed').slider({
                    step: .01,
                    min: parseFloat(0),
                    max: parseFloat(10),
                    slide: this.primPropertyUpdate,
                    stop: this.primPropertyUpdate,
                    value: val
                });

                this.addPropertyEditorDialog(node.id, 'animationSpeed', $('#' + nodeid + 'animationSpeed'), 'slider');
                this.addPropertyEditorDialog(node.id, 'animationSpeed', $('#' + nodeid + 'animationSpeed' + 'value'), 'text');



                $('#animationSettings' + nodeid).append('<div id="' + nodeid + 'play' + '" nodename="' + nodeid + '" methodname="' + 'play' + '"/>');
                $('#' + nodeid + 'play').button({
                    label: 'Play'
                });
                $('#' + nodeid + 'play').css('display', 'block');
                $('#' + nodeid + 'play').click(function() {
                    var nodename = $(this).attr('nodename');
                    var method = $(this).attr('methodname');
                    _PrimitiveEditor.callMethod(nodename, method);
                });

                $('#animationSettings' + nodeid).append('<div id="' + nodeid + 'pause' + '" nodename="' + nodeid + '" methodname="' + 'pause' + '"/>');
                $('#' + nodeid + 'pause').button({
                    label: 'Pause'
                });
                $('#' + nodeid + 'pause').css('display', 'block');
                $('#' + nodeid + 'pause').click(function() {
                    var nodename = $(this).attr('nodename');
                    var method = $(this).attr('methodname');
                    _PrimitiveEditor.callMethod(nodename, method);
                });

            }
        }
        this.setupEditorData = function(node,panelid, wholeselection,editordata) {
            
            if (wholeselection && _Editor.getSelectionCount() > 1) nodeid = 'selection';
            
            var nodeid = node.id;
            editordatanames = [];
            for (var i in editordata) {
                editordatanames.push(i);
            }
            if (editordatanames.length == 0) return;
            editordatanames.sort();
            section = '<h3 class="modifiersection" ><a href="#"><div style="font-weight:bold;display:inline">' + (vwf.getProperty(node.id, 'type') || "Type") + ": </div>" + (node.properties.DisplayName || "None") + '</a></h3>' + '<div class="modifiersection" id="basicSettings' + panelid + '">' + '</div>';
           
            $("#accordion").append(section);

            var addedWidget = false;
            for (var j = 0; j < editordatanames.length; j++) {
                var i = editordatanames[j];
                //if multiple editorData properties up the prototype chain have the same editor objects, skip
                
                if(this.currentWidgets[nodeid + i]) continue;
                this.currentWidgets[nodeid + i] = true;
                addedWidget = true;
                if (editordata[i].type == 'sectionTitle') {
                    var inputstyle = "";
                    $('#basicSettings' + panelid).append('<div style="" class = "EditorDataSectionTitle">' + editordata[i].displayname + ': </div>');
                }
                if (editordata[i].type == 'label') {
 

                    $('#basicSettings' + panelid).append('<div id="' + nodeid + editordata[i].property + 'value"></div>');
                    this.addPropertyEditorDialog(node.id, editordata[i].property, $('#' + nodeid + editordata[i].property + 'value'), 'label');
                    var val = vwf.getProperty(node.id, editordata[i].property);
                    $('#' + nodeid + editordata[i].property + 'value').text(val);
                }
                if (editordata[i].type == 'slider') {
                    var inputstyle = "";
                    $('#basicSettings' + panelid).append('<div class="editorSliderLabel">' + editordata[i].displayname + ': </div>');
                    $('#basicSettings' + panelid).append('<input class="primeditorinputbox" style="' + inputstyle + '" type="" id="' + nodeid + editordata[i].property + 'value"></input>');
                    //	$('#' + nodeid + editordata[i].property + 'value').val(vwf.getProperty(node.id, editordata[i].property));
                    //	$('#' + nodeid + editordata[i].property + 'value').change(this.primPropertyTypein);
                    $('#' + nodeid + editordata[i].property + 'value').attr("nodename", nodeid);
                    $('#' + nodeid + editordata[i].property + 'value').attr("propname", editordata[i].property);
                    $('#' + nodeid + editordata[i].property + 'value').attr("slider", '#' + nodeid + i);
                    $('#' + nodeid + editordata[i].property + 'value').spinner({
                        step: parseFloat(editordata[i].step) || 1,
                        change: this.primPropertyTypein,
                        spin: this.primSpinner
                    });
                    $('#' + nodeid + editordata[i].property + 'value').on('keyup',function(e,ui){
                        if(!isNaN(parseFloat($(this).val())))
                            _PrimitiveEditor.primPropertyTypein.apply(this);
                    });
                    $('#' + nodeid + editordata[i].property + 'value').spinner('value', vwf.getProperty(node.id, editordata[i].property));
                    $('#' + nodeid + editordata[i].property + 'value').parent().css('float', 'right');

                    $('#basicSettings' + panelid).append('<div id="' + nodeid + i + '" nodename="' + nodeid + '" propname="' + editordata[i].property + '"/>');
                    var val = vwf.getProperty(node.id, editordata[i].property);
                    if (val == undefined) val = 0;
                    $('#' + nodeid + i).slider({
                        step: parseFloat(editordata[i].step) || 1,
                        min: parseFloat(editordata[i].min),
                        max: parseFloat(editordata[i].max),
                        slide: this.primPropertySlide,
                        stop: this.primPropertySlideStop,
                        start: this.primPropertySlideStart,
                        value: val
                    });

                    this.addPropertyEditorDialog(node.id, editordata[i].property, $('#' + nodeid + i), 'slider');
                    this.addPropertyEditorDialog(node.id, editordata[i].property, $('#' + nodeid + editordata[i].property + 'value'), 'text');
                }
                if (editordata[i].type == 'check') {
                    $('#basicSettings' + panelid).append('<div><input style="vertical-align: middle" type="checkbox" id="' + i + nodeid + '" nodename="' + nodeid + '" propname="' + editordata[i].property + '"/><div style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">' + editordata[i].displayname + ': </div></div>');
                    var val = vwf.getProperty(node.id, editordata[i].property);
                    $('#' + i + nodeid).click(this.primPropertyChecked);
                    if (val == true) {
                        $('#' + i + nodeid).prop('checked', 'checked');
                    }

                    this.addPropertyEditorDialog(node.id, editordata[i].property, $('#' + i + nodeid), 'check');
                    //$('#'+i).
                }
                if (editordata[i].type == 'button') {

                    $('#basicSettings' + panelid).append('<div id="' + nodeid + i + '" nodename="' + nodeid + '" methodname="' + editordata[i].method + '"/>');
                    $('#' + nodeid + i).button({
                        label: editordata[i].label
                    });
                    $('#' + nodeid + i).css('display', 'block');
                    $('#' + nodeid + i).click(function() {
                        var nodename = $(this).attr('nodename');
                        var method = $(this).attr('methodname');
                        _PrimitiveEditor.callMethod(nodename, method);
                    });
                }
                if (editordata[i].type == 'choice') {


                    //	$('#basicSettings' + panelid).append('<input type="button" style="width: 100%;font-weight: bold;" id="' + nodeid + i + '" nodename="' + nodeid + '" propname="' +  editordata[i].property + '"/>');
                    $('#basicSettings' + panelid).append('<div><div class="editorSliderLabel">' + editordata[i].displayname + ': </div>' + '<select id="' + nodeid + i + '" style="float:right;clear:right" ' + ' nodename="' + nodeid + '" propname="' + editordata[i].property + '"" ></select></div>');

                    $('#' + nodeid + i).val(editordata[i].displayname + ": " + editordata[i].labels[vwf.getProperty(node.id, editordata[i].property)]);
                    $('#' + nodeid + i).attr('index', i);

                    for (var k = 0; k < editordata[i].labels.length; k++) {
                        $('#' + nodeid + i).append("<option value='" + editordata[i].values[k] + "'>  " + editordata[i].labels[k] + "  </option>")
                    }
                    //$('#' + nodeid + i).button();


                    //find and select the current value in the dropdown
                    var selectedindex = editordata[i].values.indexOf(vwf.getProperty(node.id, editordata[i].property+''));
                    var selectedLabel = editordata[i].labels[selectedindex];
                    $("select option").filter(function() {
                        //may want to use $.trim in here
                        return $.trim($(this).text()) == $.trim(selectedLabel);
                    }).prop('selected', true);

                    $('#' + nodeid + i).on('selectmenuchange',function() {

                        var propname = $(this).attr('propname');
                        var nodename = $(this).attr('nodename');

                        var value = $(this).val();
                        var div = this;
                        _PrimitiveEditor.setProperty(nodename, propname, value);

                    });
                    this.addPropertyEditorDialog(node.id, editordata[i].property, $('#' + nodeid + i), 'text');
                    $('#' + nodeid + i).selectmenu();
                   $('#' + nodeid + i).val(editordata[i].values[selectedindex]).selectmenu('refresh', true);
                    //$('#'+i).
                }
                if (editordata[i].type == 'rangeslider') {
                    $('#basicSettings' + panelid).append('<div  class="editorSliderLabel">' + editordata[i].displayname + ': </div>');
                    $('#basicSettings' + panelid).append('<div style="display: block;margin: 5px;" id="' + nodeid + i + '" nodename="' + nodeid + '" propnamemax="' + editordata[i].property[2] + '" propnamemin="' + editordata[i].property[1] + '"/>');
                    var setval = vwf.getProperty(node.id, editordata[i].property[0]);
                    var minval = vwf.getProperty(node.id, editordata[i].property[1]);
                    var maxval = vwf.getProperty(node.id, editordata[i].property[2]);
                    var val = [minval || editordata[i].min, maxval || editordata[i].max]
                    $('#' + nodeid + i).slider({
                        range: true,
                        step: parseFloat(editordata[i].step || 1),
                        min: parseFloat(editordata[i].min),
                        max: parseFloat(editordata[i].max),
                        values: val,
                        slide: function(e, ui) {
                            var propmin = $(this).attr('propnamemin');
                            var propmax = $(this).attr('propnamemax');
                            var nodeid = $(this).attr('nodename');
                            _PrimitiveEditor.setProperty(nodeid, propmin, parseFloat(ui.values[0]));
                            _PrimitiveEditor.setProperty(nodeid, propmax, parseFloat(ui.values[1]));
                        },
                        stop: function(e, ui) {
                            var propmin = $(this).attr('propnamemin');
                            var propmax = $(this).attr('propnamemax');
                            var nodeid = $(this).attr('nodename');
                            _PrimitiveEditor.setProperty(nodeid, propmin, parseFloat(ui.values[0]));
                            _PrimitiveEditor.setProperty(nodeid, propmax, parseFloat(ui.values[1]));
                        }
                    });
                }
                if (editordata[i].type == 'rangevector') {
                    if(!editordata[i].step) editordata[i].step = 1;
                    var vecvalchanged = function(e) {
                        var propname = $(this).attr('propname');
                        var component = $(this).attr('component');
                        var nodeid = $(this).attr('nodename');
                        var thisid = $(this).attr('id');
                        thisid = thisid.substr(0, thisid.length - 1);
                        var x = $('#' + thisid + 'X').val();
                        var y = $('#' + thisid + 'Y').val();
                        var z = $('#' + thisid + 'Z').val();
                        _PrimitiveEditor.setProperty(nodeid, propname, [parseFloat(x), parseFloat(y), parseFloat(z)]);
                    }
                    $('#basicSettings' + panelid).append('<div  class="editorSliderLabel">' + editordata[i].displayname + ': </div>');
                    var baseid = 'basicSettings' + panelid + i + 'min';
                    $('#basicSettings' + panelid).append('<div style="text-align:right"><div style="display:inline" >min:</div> <div style="display:inline-block;">' + '<input id="' + baseid + 'X' + '" component="X" nodename="' + nodeid + '" propname="' + editordata[i].property[0] + '" type="number" step="' + editordata[i].step + '" class="vectorinputfront"/>' + '<input id="' + baseid + 'Y' + '" component="Y" nodename="' + nodeid + '" propname="' + editordata[i].property[0] + '" type="number" step="' + editordata[i].step + '" class="vectorinput"/>' + '<input id="' + baseid + 'Z' + '" component="Z" nodename="' + nodeid + '" propname="' + editordata[i].property[0] + '" type="number" step="' + editordata[i].step + '" class="vectorinput"/>' + '</div></div>');
                    var propmin = vwf.getProperty(node.id, editordata[i].property[0]);
                    if (propmin) {
                        $('#' + baseid + 'X').val(propmin[0]);
                        $('#' + baseid + 'Y').val(propmin[1]);
                        $('#' + baseid + 'Z').val(propmin[2]);
                    }
                    $('#' + baseid + 'X').change(vecvalchanged);
                    $('#' + baseid + 'Y').change(vecvalchanged);
                    $('#' + baseid + 'Z').change(vecvalchanged);
                    baseid = 'basicSettings' + panelid + i + 'max';
                    $('#basicSettings' + panelid).append('<div style="text-align:right"><div style="display:inline">max:</div> <div style="display:inline-block;">' + '<input id="' + baseid + 'X' + '" component="X" nodename="' + nodeid + '" propname="' + editordata[i].property[1] + '" type="number" step="' + editordata[i].step + '"  class="vectorinputfront"/>' + '<input id="' + baseid + 'Y' + '" component="Y" nodename="' + nodeid + '" propname="' + editordata[i].property[1] + '" type="number" step="' + editordata[i].step + '"  class="vectorinput"/>' + '<input id="' + baseid + 'Z' + '" component="Z" nodename="' + nodeid + '" propname="' + editordata[i].property[1] + '" type="number" step="' + editordata[i].step + '"  class="vectorinput"/>' + '</div></div>');
                    var propmax = vwf.getProperty(node.id, editordata[i].property[1]);
                    if (propmax) {
                        $('#' + baseid + 'X').val(propmax[0]);
                        $('#' + baseid + 'Y').val(propmax[1]);
                        $('#' + baseid + 'Z').val(propmax[2]);
                    }
                    $('#' + baseid + 'X').change(vecvalchanged);
                    $('#' + baseid + 'Y').change(vecvalchanged);
                    $('#' + baseid + 'Z').change(vecvalchanged);
                }
                if (editordata[i].type == 'vector') {
                    var vecvalchanged = function(e) {
                            var propname = $(this).attr('propname');
                            var component = $(this).attr('component');
                            var nodeid = $(this).attr('nodename');
                            var thisid = $(this).attr('id');
                            thisid = thisid.substr(0, thisid.length - 1);
                            var x = $('#' + thisid + 'X').val();
                            var y = $('#' + thisid + 'Y').val();
                            var z = $('#' + thisid + 'Z').val();
                            _PrimitiveEditor.setProperty(nodeid, propname, [parseFloat(x), parseFloat(y), parseFloat(z)]);
                        }
                        //$('#basicSettings'+nodeid).append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">'+editordata[i].displayname+': </div>');
                    var baseid = 'basicSettings' + panelid + i + 'min';
                    $('#basicSettings' + panelid).append('<div class="editorSliderLabel"  style="width:100%;text-align: left;margin-top: 4px;" ><div style="display:inline" >' + editordata[i].displayname + ':</div> <div style="display:inline-block;float:right">' + '<input id="' + baseid + 'X' + '" component="X" nodename="' + nodeid + '" propname="' + editordata[i].property + '" type="number" step="' + editordata[i].step + '" class="vectorinputfront"/>' + '<input id="' + baseid + 'Y' + '" component="Y" nodename="' + nodeid + '" propname="' + editordata[i].property + '" type="number" step="' + editordata[i].step + '" class="vectorinput"/>' + '<input id="' + baseid + 'Z' + '" component="Z" nodename="' + nodeid + '" propname="' + editordata[i].property + '" type="number" step="' + editordata[i].step + '" class="vectorinput"/>' + '</div><div style="clear:both"/></div>');
                    var propmin = vwf.getProperty(node.id, editordata[i].property);
                    if (propmin) {
                        $('#' + baseid + 'X').val(propmin[0]);
                        $('#' + baseid + 'Y').val(propmin[1]);
                        $('#' + baseid + 'Z').val(propmin[2]);
                    }
                    $('#' + baseid + 'X').change(vecvalchanged);
                    $('#' + baseid + 'Y').change(vecvalchanged);
                    $('#' + baseid + 'Z').change(vecvalchanged);
                }
                if (editordata[i].type == 'map') {
                    $('#basicSettings' + panelid).append('<div style="display: block;margin: 5px;" id="' + nodeid + i + '" nodename="' + nodeid + '" propname="' + editordata[i].property + '"/>');
                    $('#' + nodeid + i).button({
                        label: editordata[i].displayname
                    });

                    $('#' + nodeid + i).prepend("<img src='"+vwf.getProperty(node.id, editordata[i].property)+"'/>");

                    $('#' + nodeid + i).click(function() {
                        _MapBrowser.setTexturePickedCallback(function(e) {
                            var propname = $(this).attr('propname');
                            var nodename = $(this).attr('nodename');
                            _MapBrowser.setTexturePickedCallback(null);
                            _PrimitiveEditor.setProperty(nodename, propname, e);
                            $(this).children('img').attr('src',e);
                        }.bind(this));
                        _MapBrowser.show();
                    });
                    $('#' + nodeid + i).css('text-align','left');
                }
                if (editordata[i].type == 'text') {
                    $('#basicSettings' + panelid).append('<div style="">' + editordata[i].displayname + '</div><input type="text" style="  background: black;border: 1px inset;display: block;width: 100%;padding: 2px;border-radius: 5px;font-weight: bold;" id="' + nodeid + i + '" nodename="' + nodeid + '" propname="' + editordata[i].property + '"/>');
                    $('#' + nodeid + i).val(vwf.getProperty(node.id, editordata[i].property));
                    $('#' + nodeid + i).keyup(function() {
                        var propname = $(this).attr('propname');
                        var nodename = $(this).attr('nodename');
                        _PrimitiveEditor.setProperty(nodename, propname, $(this).val());
                    });
                    this.addPropertyEditorDialog(node.id, editordata[i].property, $('#' + nodeid + i), 'text');
                }
                if (editordata[i].type == 'prompt') {
                    $('#basicSettings' + panelid).append('<div style="">' + editordata[i].displayname + '</div><div type="text" id="' + nodeid + i + '" nodename="' + nodeid + '" propname="' + editordata[i].property + '"/>');
                    $('#' + nodeid + i).text(vwf.getProperty(node.id, editordata[i].property));
                    $('#' + nodeid + i).button();
                    $('#' + nodeid + i).css('width','100%');
                    $('#' + nodeid + i).click(function() {

                        var propname = $(this).attr('propname');
                        var nodename = $(this).attr('nodename');
                        var div = this;
                        alertify.prompt('Enter a value for ' + propname, function(ok, value) {
                            if (ok) {
                                $(div).val(value);
                                _PrimitiveEditor.setProperty(nodename, propname, value);
                            }
                        }, $(this).val());
                    });
                }
                if (editordata[i].type == 'nodeid') {

                    $('#basicSettings' + panelid).append('<div style="margin-top: 5px;margin-bottom: 5px;"><div >' + editordata[i].displayname + '</div><input type="text" style="background: black;display: inline;width: 50%;padding: 2px;border-radius: 5px;font-weight: bold;" id="' + nodeid + editordata[i].property + '" nodename="' + nodeid + '" propname="' + editordata[i].property + '"/><div  style="float:right;width:45%;height:2em" id="' + nodeid + i + 'button" nodename="' + nodeid + '" propname="' + editordata[i].property + '"/></div><div style="clear:both" />');
                    
                   
                    $('#' + nodeid + editordata[i].property).attr('disabled', 'disabled');
                    $('#' + nodeid + i + 'button').button({
                        label: 'Choose Node'
                    });
                    $('#' + nodeid + i + 'button').mouseover(function(){

                        var propname = $(this).attr('propname');
                        var nodename = $(this).attr('nodename');
                        var id = vwf.getProperty(nodename,propname);
                        if(id && findviewnode(id))
                            _RenderManager.flashHilight(findviewnode(id));
                    })
                    var label = $('#' + nodeid + editordata[i].property);
                    $('#' + nodeid + i + 'button').click(function() {
                        var propname = $(this).attr('propname');
                        var nodename = $(this).attr('nodename');

                        _Editor.TempPickCallback = function(node) {
                            if(!node) return;
                            $('#' + nodename + propname ).val(node.id);

                            _RenderManager.flashHilight(findviewnode(node.id));

                            _Editor.TempPickCallback = null;
                            _Editor.SetSelectMode('Pick');

                            _PrimitiveEditor.setProperty(nodename, propname, node.id);
                        };
                        _Editor.SetSelectMode('TempPick');

                    });

                    this.addPropertyEditorDialog(node.id, editordata[i].property, $('#' + nodeid + editordata[i].property), 'text');
                     $('#' + nodeid + editordata[i].property).val(vwf.getProperty(node.id, editordata[i].property));
                }
                if (editordata[i].type == 'color') {
                    var colorswatchstyle = "margin: 5px;float:right;clear:right;background-color: #FF19E9;width: 25px;height: 25px;border: 2px solid lightgray;border-radius: 3px;display: inline-block;margin-left: 20px;vertical-align: middle;box-shadow: 2px 2px 5px,1px 1px 3px gray inset;background-image: url(vwf/view/editorview/images/select3.png);background-position: center;";
                    $('#basicSettings' + panelid).append('<div style="margin-bottom:10px" id="' + nodeid + i + '" />');
                    $('#' + nodeid + i + '').append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 15px;"  class="editorSliderLabel">' + editordata[i].displayname + ': </div>');
                    $('#' + nodeid + i + '').append('<div id="' + nodeid + i + 'ColorPicker" style="' + colorswatchstyle + '"></div>')
                    var colorval = vwf.getProperty(node.id, editordata[i].property);
                    if (!colorval) colorval = [1, 1, 1];
                    colorval = 'rgb(' + parseInt(colorval[0] * 255) + ',' + parseInt(colorval[1] * 255) + ',' + parseInt(colorval[2] * 255) + ')';
                    $('#' + nodeid + i + 'ColorPicker').css('background-color', colorval);
                    var parentid = nodeid + i + 'ColorPicker';
                    $('#' + nodeid + i + 'ColorPicker').ColorPicker({
                        colorpickerId: parentid + 'picker',
                        onShow: function(e) {
                            $(e).fadeIn();
                        },
                        onHide: function(e) {
                            $(e).fadeOut();
                            return false
                        },
                        onSubmit: function(hsb, hex, rgb) {
                            $('#' + (this.attr('parentid'))).css('background-color', "#" + hex);
                            _PrimitiveEditor.setProperty(this.attr('nodeid'), this.attr('propname'), [rgb.r / 255, rgb.g / 255, rgb.b / 255]);
                        },
                        onChange: function(hsb, hex, rgb) {
                            $('#' + (this.attr('parentid'))).css('background-color', "#" + hex);
                            _PrimitiveEditor.setProperty(this.attr('nodeid'), this.attr('propname'), [rgb.r / 255, rgb.g / 255, rgb.b / 255]);
                        }
                    });
                    $('#' + $('#' + nodeid + i + 'ColorPicker').data('colorpickerId')).attr('parentid', parentid);;
                    $('#' + $('#' + nodeid + i + 'ColorPicker').data('colorpickerId')).attr('propname', editordata[i].property);
                    $('#' + $('#' + nodeid + i + 'ColorPicker').data('colorpickerId')).attr('nodeid', nodeid);
                    this.addPropertyEditorDialog(node.id, editordata[i].property, $('#' + nodeid + i + 'ColorPicker'), 'color');
                }
                
            }
            if(!addedWidget)
                {
                    
                    $("#accordion").children().last().remove();
                    $("#accordion").children().last().remove();
                }
            if(addedWidget)
            {   
                var randomname = GUID();
                $('#basicSettings' + panelid).append('<div style="margin-top: 1em;" nodename="' + node.id + '" id="' + nodeid + randomname+ 'deletebutton"/>');
                $('#' + nodeid +randomname+ 'deletebutton').button({
                    label: 'Delete'
                });
                $('#' + nodeid + randomname+'deletebutton').click(this.deleteButtonClicked);
                $('#basicSettings' + panelid).append('<div style="margin-top: 1em;" nodename="' + node.id + '" id="' + nodeid +randomname+ 'selectbutton"/>');
                $('#' + nodeid +randomname+ 'selectbutton').button({
                    label: 'Select'
                });
                $('#' + nodeid +randomname+ 'selectbutton').click(this.selectButtonClicked);
                //remove save button. too confusing
                // $('#basicSettings' + panelid).append('<div style="margin-top: 1em;" nodename="' + node.id + '" id="' + nodeid + 'savebutton"/>');
                // $('#' + nodeid + 'savebutton').button(
                // {
                // label: 'Save'
                // });
                // $('#' + nodeid + 'savebutton').click(this.saveButtonClicked);
                $('#basicSettings' + panelid).append('<div style="margin-top: 1em;" nodename="' + node.id + '" id="' + nodeid + randomname+'copybutton"/>');
                $('#' + nodeid +randomname+ 'copybutton').button({
                    label: 'Copy'
                });
                $('#' + nodeid + randomname+'copybutton').click(this.copyButtonClicked);
            }
        }
        this.deleteButtonClicked = function() {
            
            if (document.PlayerNumber == null) {
                _Notifier.notify('You must log in to participate');
                return;
            }
            var id = $(this).attr('nodename');
            if (_PermissionsManager.getPermission(_UserManager.GetCurrentUserName(), id) == 0) {
                _Notifier.notify('You do not have permission to delete this object');
                return;
            }
            if (id == _Editor.GetSelectedVWFNode().id) {
                _Editor.DeleteSelection();
            } else {
                vwf_view.kernel.deleteNode(id);
                //vwf_view.kernel.callMethod(_Editor.GetSelectedVWFNode().id, 'dirtyStack');
                window.setTimeout(function() {
                    _PrimitiveEditor.SelectionChanged(null, _Editor.GetSelectedVWFNode());
                }, 500);
            }
        }
        this.selectButtonClicked = function() {
            var id = $(this).attr('nodename');
            _Editor.SelectObject(id);
        }
        this.copyButtonClicked = function() {
            var id = $(this).attr('nodename');

            _Editor.Copy([{
                id: id
            }]);
        }
        this.saveButtonClicked = function() {
            var id = $(this).attr('nodename');
            _InventoryManager.Take(id);
        }
        this.modifierAmountUpdate = function(e, ui) {
            var id = $(this).attr('nodename');
            var amount = ui.value;
            _PrimitiveEditor.setProperty(id, 'amount', amount);
        }
        this.positionChanged = function() {
            
            var self = this;
            async.nextTick(function(){
             self.setTransform();    
            })
            
        }
        this.makeRotMat = function(x, y, z) {
            var xm = [

                1, 0, 0, 0,
                0, Math.cos(x), -Math.sin(x), 0,
                0, Math.sin(x), Math.cos(x), 0,
                0, 0, 0, 1

            ];

            var ym = [

                Math.cos(y), 0, Math.sin(y), 0,
                0, 1, 0, 0, -Math.sin(y), 0, Math.cos(y), 0,
                0, 0, 0, 1
            ];

            var zm = [

                Math.cos(z), -Math.sin(z), 0, 0,
                Math.sin(z), Math.cos(z), 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1

            ];
            return goog.vec.Mat4.multMat(xm, goog.vec.Mat4.multMat(ym, zm, []), []);

        }
        this.rotationMatrix_2_XYZ = function(m) {
            var x = Math.atan2(m[9], m[10]);
            var y = Math.atan2(-m[8], Math.sqrt(m[9] * m[9] + m[10] * m[10]));
            var z = Math.atan2(m[4], m[0]);
            return [x, y, z];
        }
        this.setTransform = function() {

            var val = [0, 0, 0];
            val[0] = $('#RotationX').val();
            val[1] = $('#RotationY').val();
            val[2] = $('#RotationZ').val();

            if(isNaN(val[0])) val[0] = 0;
            if(isNaN(val[1])) val[1] = 0;
            if(isNaN(val[2])) val[2] = 0;

            var rotmat = this.makeRotMat(parseFloat(val[0]) / 57.2957795, parseFloat(val[1]) / 57.2957795, parseFloat(val[2]) / 57.2957795);
            var scale = [parseFloat($('#ScaleX').val()), parseFloat($('#ScaleY').val()), parseFloat($('#ScaleZ').val())];
            var pos = [parseFloat($('#PositionX').val()), parseFloat($('#PositionY').val()), parseFloat($('#PositionZ').val())];

            if(isNaN(pos[0])) pos[0] = 0;
            if(isNaN(pos[1])) pos[1] = 0;
            if(isNaN(pos[2])) pos[2] = 0;

            if(isNaN(scale[0])) scale[0] = 1;
            if(isNaN(scale[1])) scale[1] = 1;
            if(isNaN(scale[2])) scale[2] = 1;

            rotmat = goog.vec.Mat4.scale(rotmat, scale[0], scale[1], scale[2]);

            pos = goog.vec.Mat4.translate(goog.vec.Mat4.createIdentity(), pos[0], pos[1], pos[2])

            var val = goog.vec.Mat4.multMat(pos, rotmat, []);

            var self = this;
            async.nextTick(function()
            {
                self.setProperty(_Editor.GetSelectedVWFNode().id, 'transform', val);    
            })
            
        }
        this.rotationChanged = function() {
           var self = this;
            async.nextTick(function(){
             self.setTransform();    
            })
        }
        this.scaleChanged = function() {
            var self = this;
            async.nextTick(function(){
             self.setTransform();    
            })
        }
        this.initializedProperty = function (nodeID, propName, propVal)
        {
            this.satProperty(nodeID, propName, propVal);
        }
        this.satProperty = function(nodeID, propName, propVal) {


            for (var i = 0; i < this.propertyEditorDialogs.length; i++) {

                var diag = this.propertyEditorDialogs[i];

                if (diag.propName == propName && diag.nodeid == nodeID) {
                    //typing into the textbox can be infuriating if it updates while you type!
                    //need to filter out sets from self
                    if (diag.type == 'text' && vwf.client() != vwf.moniker())
                        diag.element.val(propVal);
                    if (diag.type == 'label')
                        diag.element.text(propVal);
                    if (diag.type == 'slider')
                        diag.element.slider('value', propVal);
                    if (diag.type == 'check')
                        diag.element.prop('checked', propVal);
                }
            }
            //if the editor data changes while the object is selected, redraw
            if(_Editor.GetSelectedVWFID() == nodeID && propName == "EditorData" && this.isOpen())
            {
            	_PrimitiveEditor.SelectionChanged(null, _Editor.GetSelectedVWFNode());
            }
            

            
            //if the editordata of a child behavior changes while selected, redraw
            //TODO:handle modifiers
            //TODO:redraw without animation
            if(_Editor.GetSelectedVWFID() == vwf.parent(nodeID) && isBehavior(nodeID) && propName == "EditorData" && this.isOpen())
            {
            	_PrimitiveEditor.SelectionChanged(null, _Editor.GetSelectedVWFNode());
            }
        }
        this.addPropertyEditorDialog = function(nodeid, propname, element, type) {
            this.propertyEditorDialogs.push({
                propName: propname,
                type: type,
                element: element,
                nodeid: nodeid

            });
        }
        this.clearPropertyEditorDialogs = function() {
            this.propertyEditorDialogs = [];
        }
        this.SelectionTransformed = function(e, node) {
            try {
                //dont update the spinners when the user is typing in them, but when they drag the gizmo do. 
                if (node && (vwf.client() !== vwf.moniker()) || $("#index-vwf:focus").length ==1) {

                    var mat = vwf.getProperty(node.id, 'transform');
                    var angles = this.rotationMatrix_2_XYZ(mat);
                    var pos = [mat[12],mat[13],mat[14]];

                    var scl = [MATH.lengthVec3([mat[0],mat[4],mat[8]]),MATH.lengthVec3([mat[1],mat[5],mat[9]]),MATH.lengthVec3([mat[2],mat[6],mat[10]])]
                    $('#PositionX').val(Math.floor(pos[0] * 1000) / 1000);
                    $('#PositionY').val(Math.floor(pos[1] * 1000) / 1000);
                    $('#PositionZ').val(Math.floor(pos[2] * 1000) / 1000);

                    //since there is ambiguity in the matrix, we need to keep these values aroud. otherwise , the typeins don't really do what you would think		
                    $('#RotationX').val(Math.round(angles[0] * 57.2957795));
                    $('#RotationY').val(Math.round(angles[1] * 57.2957795));
                    $('#RotationZ').val(Math.round(angles[2] * 57.2957795));

                    //$('#RotationW').val(rot[3]);
                    //well, this is embarassing. Old code from years ago, reflecting incorrect idea about how 
                    //transform matrix works
              
                    $('#ScaleX').val((Math.floor(MATH.lengthVec3([mat[0],mat[1],mat[2]]) * 1000)) / 1000);
                    $('#ScaleY').val((Math.floor(MATH.lengthVec3([mat[4],mat[5],mat[6]]) * 1000)) / 1000);
                    $('#ScaleZ').val((Math.floor(MATH.lengthVec3([mat[8],mat[9],mat[10]]) * 1000)) / 1000);

                }
            } catch (e) {
                //console.log(e);
            }
        }
        
        $(document).bind('modifierCreated', this.SelectionChanged.bind(this));
        $(document).bind('selectionTransformedLocal', this.SelectionTransformed.bind(this));
       
        $('#PositionX').on( "spinchange",this.positionChanged.bind(this));
        $('#PositionY').on( "spinchange",this.positionChanged.bind(this));
        $('#PositionZ').on( "spinchange",this.positionChanged.bind(this));
        $('#RotationX').on( "spinchange",this.rotationChanged.bind(this));
        $('#RotationY').on( "spinchange",this.rotationChanged.bind(this));
        $('#RotationZ').on( "spinchange",this.rotationChanged.bind(this));
        $('#RotationW').on( "spinchange",this.rotationChanged.bind(this));
        $('#ScaleX').on( "spinchange",this.scaleChanged.bind(this));
        $('#ScaleY').on( "spinchange",this.scaleChanged.bind(this));
        $('#ScaleZ').on( "spinchange",this.scaleChanged.bind(this));

        $('#PositionX').on( "spin",this.positionChanged.bind(this));
        $('#PositionY').on( "spin",this.positionChanged.bind(this));
        $('#PositionZ').on( "spin",this.positionChanged.bind(this));
        $('#RotationX').on( "spin",this.rotationChanged.bind(this));
        $('#RotationY').on( "spin",this.rotationChanged.bind(this));
        $('#RotationZ').on( "spin",this.rotationChanged.bind(this));
        $('#RotationW').on( "spin",this.rotationChanged.bind(this));
        $('#ScaleX').on( "spin",this.scaleChanged.bind(this));
        $('#ScaleY').on( "spin",this.scaleChanged.bind(this));
        $('#ScaleZ').on( "spin",this.scaleChanged.bind(this));

        $('#PositionX').on( "keyup",this.positionChanged.bind(this));
        $('#PositionY').on( "keyup",this.positionChanged.bind(this));
        $('#PositionZ').on( "keyup",this.positionChanged.bind(this));
        $('#RotationX').on( "keyup",this.rotationChanged.bind(this));
        $('#RotationY').on( "keyup",this.rotationChanged.bind(this));
        $('#RotationZ').on( "keyup",this.rotationChanged.bind(this));
        $('#RotationW').on( "keyup",this.rotationChanged.bind(this));
        $('#ScaleX').on( "keyup",this.scaleChanged.bind(this));
        $('#ScaleY').on( "keyup",this.scaleChanged.bind(this));
        $('#ScaleZ').on( "keyup",this.scaleChanged.bind(this));

        $('#RotationW').hide();
        this.hide();
    }
});