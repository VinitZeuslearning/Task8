 export default class CommandObj {
    constructor( cellDataObj, masterHm, masterWm ) {
        this.cellDataObj = cellDataObj;
        this.masterHm = masterHm;
        this.masterWm = masterWm;
        this.stackUndo = [];
        this.stackRedo = [];
    }

    pushCellDataCmd( newValue , oldValue, row , col ) {
        const Obj = {
            undo : function ( ) {
                let r = row;
                let c = col;
                let ov = oldValue;
                this.cellDataObj.set( r, c, ov );
            }.bind(this),
            redo : function ( ) {
                let r = row;
                let c = col;
                let nv = newValue;
                this.cellDataObj.set( r, c, nv );
            }.bind(this)
        }
        this.stackUndo.push( Obj );
    }

    pushResizeRowCmd( newValue, oldValue, row ) {
        const Obj = {
            undo : function () {
                let r = row;
                let ov = oldValue;
                this.masterHm.set( r, ov );
            }.bind(this),
            redo : function () {
                let r = row;
                let nv = newValue;
                this.masterHm.set( r, nv );
            }.bind(this)
        }
        Obj.undo.bind( this );
        Obj.redo.bind( this );
        this.stackUndo.push( Obj );
    }

    pushResizeColCmd( newValue, oldValue, col ) {
        const Obj = {
            undo : function () {
                let c = col;
                let ov = oldValue;
                this.masterWm.set( c, ov );
            }.bind(this),
            redo : function () {
                let c = col;
                let nv = newValue;
                this.masterWm.set( c, nv );
            }.bind(this)
        }
        Obj.undo.bind( this );
        Obj.redo.bind( this );
        this.stackUndo.push( Obj );
    }

    undo( ) {
        let tmp = this.stackUndo[ this.stackUndo.length - 1 ];
        tmp.undo();
        this.stackUndo.pop();
        this.stackRedo.push( tmp );
    }

    redo () {
        let tmp = this.stackRedo[ this.stackRedo.length - 1 ];
        tmp.redo();
        this.stackRedo.pop();
        this.stackUndo.push( tmp );
    } 
}