const html = htm.bind(React.createElement);

// ================== data =========================================================


const headers = ['Book', 'Author', 'Language', 'Published', 'Sales'];  

const data = [
    [
        'A tale of two Cities', 'Charles Dickens',
        'English', '1859', '200 million'
    ],
    [
        'Le Petit Prince (The Little Prince)', 'Antoine de Saint-Exupery',
        'French', '1943', '150 million'
    ],
    [
        "Harry Potter and the Philosopher's Stone", 'J.K Rowling',
        'English', '1997', '120 million'
    ],
    [
        'And Then There Were None', 'Agatha Christie',
        'English', '1939', '100 million',
    ],
    [
        'Dream of the Red Chamber', 'Cao Xueqin',
        'Chinese', '1791', '100 million',
    ],
    [
        'The Hobbit', 'J. R. R. Tolkien',
        'English', '1937', '100 million',
    ],
]
// =================================== Hulp functies =======================================

function clone(o) {
        return JSON.parse(JSON.stringify(o));
    }


//====================================== HTML components ===================================

const formComponent = (cell, save) => {
return html`
<form className="form-inline" onSubmit=${save}>
  <div className="form-group mb-2">
    <input type="text" className="form-control" defaultValue=${cell} />
  </div>
  <button type="submit" className="btn btn-primary mb-2">Confirm</button>
</form>
`
}


// ======================================= React components =================================

class Excel extends React.Component {
    constructor(props) {
        super();
        const data = clone(props.initialData).map( (row, idx) => row.concat(idx))
        this.state = {
            data,
            sortby: null,
            descending: false,
            edit: null,
            search: false
        }
        this.preSearchData = null;
        this.sort = this.sort.bind(this);
        this.showEditor = this.showEditor.bind(this);
        this.save = this.save.bind(this);
        this.toggleSearch = this.toggleSearch.bind(this);
        this.search = this.search.bind(this);
    }

    
    sort(e) {
        // TODO: implement me
        const column = e.target.cellIndex;
        const data = clone(this.state.data);
        const descending = this.state.sortby === column && !this.state.descending;

        data.sort( (a, b) => {
            if (a[column] === b[column]) {
                return 0;
            }
            return  descending
            ? a[column] < b[column]
                ? 1 : -1
            : a[column] > b[column]
                ? 1
                : -1;
        });
        this.setState({
            data,
            sortby: column,
            descending
        });

    }

    showEditor(e) {
        this.setState({
            edit: {
                row: parseInt(e.target.parentNode.dataset.row, 10),
                column: e.target.cellIndex
            }
        });
    }

    save(e) {
        e.preventDefault();
        const input = e.target.firstChild.firstChild;
        const data = clone(this.state.data);
        data[this.state.edit.row][this.state.edit.column] = input.value;
        this.setState({
            edit: null,
            data,
        });
    }

    toggleSearch() {
        if (this.state.search) {
            this.setState({
                data: this.preSearchData,
                search: false
            });
            this.preSearchData = null;
        } else {
            this.preSearchData = this.state.data;
            this.setState({
                search: true
            });
        }
    }

    search() {
        const needle = e.target.value.toLowerCase();
        if (!needle) {
            this.setState({data: this.preSearchData});
            return;
        }
        const idx = e.target.dataset.idx;
        const searchdata = this.preSearchData.filter( (row) => {
            return row[idx].toString().toLowerCase().indexOf(needle) > -1;
        });
        this.setState({data: searchdata});
    }

    render() {
        
//==============================================================


const searchRow = !this.state.search ? null : html`
<tr onChange=${this.search}>
    ${this.props.headers.map( (_, idx) => 
        html`
        <td key=${idx}>
            <input type="text" data-idx=${idx}>
        </td>
        `
        )}
</tr>
`

//===============================================================

    return html`
     <div>
      <button className="toolbar" onClick=${this.toggleSearch}>
        ${this.state.search ? 'Hide search' : 'Show search'}
      </button>

      <table className="table">
        <thead onClick=${this.sort}>
            <tr>
                ${this.props.headers.map((title, idx) => {
                    if(this.state.sortby === idx) {
                        title += this.state.descending ? ' \u2191' : ' \u2193'
                    }
                    return  html`<th scope="col" key=${idx}>${title}</th>`
                    })}
            </tr>
        </thead>
        <tbody onDoubleClick=${this.showEditor}>
            ${this.state.data.map( (row, rowidx) =>
                html`
                    <tr scope="row" key=${rowidx} data-row=${rowidx}>
                     ${row.map( (cell, columnidx) => {
                        const edit = this.state.edit;
                        if ( edit && edit.row === rowidx && edit.column === columnidx) {
                            cell = formComponent(cell,this.save) 
                        }
                       return html`<td key=${columnidx}>${cell}</td>`
                     })}
                    </tr>
                `
            )}
        </tbody>
      </table>


     </div> 
        `
    }
}

// ======================================= APP.js =============================================


const App = function() {
    return html`
   <div>
    <${Excel} headers=${headers} initialData=${data}/>
   </div>
    `
}


const domContainer = document.querySelector('#app');
const root = ReactDOM.createRoot(domContainer);
root.render(App());