import RCManager from "../DataStructure/RmCnvManager.js";
import CellData from "../DataStructure/CellData.js";

/**
 * Class which manage the actions for undo and redo operations
 * 
 * 
 * @param { CellData }  cellDataObj - data strucutre which store the value of the cells
 * @param { RCManager } masterHm - data structure which manage the height of the cells
 * @param { RCManager } masterWm - data structure which manage the width of the cells
 */
 
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
                this.masterHm.update( r, ov );
            }.bind(this),
            redo : function () {
                let r = row;
                let nv = newValue;
                this.masterHm.update( r, nv );
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
                console.log(`undoing colLabel ${col} to value ${oldValue}`)
                this.masterWm.update( c, ov );
            }.bind(this),
            redo : function () {
                let c = col;
                let nv = newValue;
                this.masterWm.update( c, nv );
            }.bind(this)
        }
        Obj.undo.bind( this );
        Obj.redo.bind( this );
        this.stackUndo.push( Obj );
    }

    undo( ) {
        if ( this.stackUndo.length == 0 ) {
            return;
        }
        let tmp = this.stackUndo[ this.stackUndo.length - 1 ];
        tmp.undo();
        this.stackUndo.pop();
        this.stackRedo.push( tmp );
    }

    redo () {
        if ( this.stackRedo.length == 0 ) {
            return;
        }
        let tmp = this.stackRedo[ this.stackRedo.length - 1 ];
        tmp.redo();
        this.stackRedo.pop();
        this.stackUndo.push( tmp );
    } 
}