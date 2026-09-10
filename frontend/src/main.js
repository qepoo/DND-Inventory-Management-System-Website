import 'bootstrap/dist/css/bootstrap.min.css'; //import bootstrap styling
import DataTable from 'datatables.net-dt'; //import DataTable
import { v4 as uuidv4 } from 'uuid'; //import unique id generator funct
import { createElement } from 'react';

const apiURL = 'http://127.0.0.1:5000/inventory';

// finds a table on the page with the matching selector
// when a row is added, creates a default column (6th) with a delete button
//
// if it's a new row created on frontend side - assign new id and upload data into api
// if the row is fetched from api assign existing data to rows and display them
const table = new DataTable('#inventory-table', {
  sorting: false,
  columns: [
    null,
    null, 
    null, 
    null,
    null,
    { visible: false },
    { defaultContent: '<button class="w-100 btn btn-primary btn-sm edit-item" title="edit-item">Edit</button>'},
    { defaultContent: '<button class="w-100 btn btn-danger btn-sm delete-item" title="delete-item">Delete</button>' },
  ],
  createdRow: function (row, data) {
    if (data[5] == 'noId') {
      row.setAttribute('id', "row-" + uuidv4());
      data[5] = row.id;

      var wrapper = document.createElement('div');
      wrapper.innerHTML = data[0]; 
      var img = wrapper.firstChild;
      
      let payload = {
        'id': `${data[5]}`,
        'icon': `${img.src}`,
        'name': `${data[1]}`,
        'desc': `${data[2]}`,
        'wght': `${data[3]}`,
        'prce': `${data[4]}`
      };

      fetch(apiURL, {
        'method': "POST",
        'headers': {'Content-Type': "application/json"},
        'body': JSON.stringify(payload),
      });
    } else {
      row.setAttribute('id', data[5]);
    }
  },
});

// [MODAL FUNCTIONS]
// store modal for multiple functions
const newRowModal = document.getElementById('newRowModal');

// opens modal with input fields for user to input data
document.getElementById('newRowBtn').addEventListener('click', () => {
  newRowModal.style.display = 'block';
});

// close modal funct
function closeModal() { 
  newRowModal.style.display = 'none';
}

// close modal on 'X' being pressed
document.getElementById('close-modal-btn').addEventListener('click', () => {
  closeModal();
  resetFormInputs();
});

// close modal on 'Escape' being pressed
document.addEventListener('keydown', (e) => {
  if (e.keyCode == 27 && newRowModal.style.display == 'block') {
    closeModal();
    resetFormInputs();
  }
});

// [ICONS RENDERING]
// store icon and iconPreview input fields for multiple functions
const icon = document.getElementById('modal-icon');
const iconPrvw = document.getElementById('icon-preview')
const name = document.getElementById('modal-name');
const desc = document.getElementById('modal-description');
const wght = document.getElementById('modal-weight');
const prce = document.getElementById('modal-price');

// callback function that renders uploaded image
function renderIcon(callback) {
  if (icon.files.length != 0) {
    const file = icon.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function() {
      callback(this.result); };
  } else { 
    callback(iconPrvw.src);
  }
}

// on file being uploaded display a preview of the chosen image
icon.addEventListener('change', () => {
  renderIcon((src) => { iconPrvw.src = src});
});

// [ROWS MANAGEMENT]
// accept inputs in the modal and create a row with these inputs
// then clear input fields and close modal
document.getElementById('new-row-form').addEventListener('submit', (event) => {
  event.preventDefault();
  
  renderIcon((src) => {
    table.row.add(
      addRowData(src, name.value, desc.value, wght.value, prce.value, null)
    ).draw();

    resetFormInputs();
    closeModal();
  });
});

// function for deleting and editing row data in a table and api
document.getElementById('inventory-table').addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-item')) {
    const row = e.target.closest('tr');
    console.log(row);
  }
  else if (e.target.classList.contains('delete-item')) {
    const row = e.target.closest('tr');
    const payload = row.id;

    try {
      fetch(apiURL, {
        'method': "DELETE",
        'headers': {'Content-Type': "application/json"},
        'body': JSON.stringify(payload),
      });

      table.row(row).remove().draw();
    } catch {
      console.error('Failed to delete item. Please try again later.');
    }
  }
});

// [HELPER FUNCTIONS]
// resets previous inputs and selected files in the form
function resetFormInputs() {
  iconPrvw.src = "data:image/png;base64,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LQKXlz0p1TMhQBDJ5tJxNmrlUlkHAZLKdmYJF+B8FHqxSVaum/PW3dlkfimpSa1cvDCstxaWWscrNrR8BICI3qi27ltKcqnTU54Di2nIWZVEy0cgpZoTunmiu9pbV/VBBlLaN0oFzIBhdL3RNU52BZXuIAIhpq5sPccj6brVPJgOok64/mLP0uD7s3fv0+gUgujdPUlvmK69ngQCidHbAfVFnVS+1i7Z6F5ce/BEnmZz4+mLuk0m2cRjfMQ7ufUch0bejbae84TtIbNgcxOg2serkR9JPokLcHgo4fpqQesbQq+vx6yNi9sxYJkOJExfKLHzPRmSfWMnjtgOPLKzX+QA4fCVl//TiX0j99zO/pF7bWcfyT22s5/k3trZV3JP7ewvuZd29pncQzv7Te6dnX0n98zO/pN7ZWcfyj2ys4vyndm/2e+FnV2Uxxz8TYMHdvan3As7+1TugZ39Knffzr6Vu25n/8rdtrOP5S7b2c9yd+3sa7mrdva33E07+1zuop39LnfPzr6Xu2Zn/8vdsnMA5C7ZOQhyd+wcCLkrdg6G3A07B0Tugp2DIldv58DIlds5OHLVdg6QXLGdgyRXa+dAyZXaOVhylXYOmFyhnYMmV2fnwMmV2Tl4clV2DqBckZ2DKFdj50DKldg5mHIVdg6oXIGdgyp3bufAyh3bObhyp3YOsNyhnYMsd2bnQMsd2TnYcid2DrjcgZ2DLp/dzoGXz2zn4MtntXMI5DPaOQzy2ewcCvlMdg6HfBY7h0Q+g53DIp/ezqGRT23n8MintXOI5FPaOUzy6ewcKvlUdg6XfBo7h0w+hZ3DJrdv59DJbds5fHK7dg6h3Kadwyi3Z+dQym3ZOZxyO3YOqdyGncMqn2zn0Mon2jm88kl2DrF8gp3DLB9v51DLx9o53PIu+91+O4dc3rFv99s57PLRdg69fKSdwy8fZec5kI+w8zzIh9t5LuRD7Twf8mF2nhP5EDvPi3zQznMjH7Dz/Mj77TxH8j47z5O81x6hzTmSAySH2Ikjti2HkaUfY0Dt1eF8yDv2Zzd8eWTMk7zV5o3DcqT5Hptv5khu1vtPh+/1COkfjs/nSQ6QHN1c6vR/nTZXdDJdpiIAAABYdEVYdENvcHlyaWdodABDQzAgUHVibGljIERvbWFpbiBEZWRpY2F0aW9uIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL3B1YmxpY2RvbWFpbi96ZXJvLzEuMC/G4735AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI2LTA3LTA5VDA5OjE2OjU5KzAwOjAwf1VXPwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNi0wNy0wOVQwOToxNjo1OSswMDowMA4I74MAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAAElFTkSuQmCC";
  icon.value = null;
  name.value = null;
  desc.value = null;
  wght.value = null;
  prce.value = null;
} 

// single function for inserting data into the new row columns
function addRowData(imgSrc, name, desc, wght, prce, id) {
  if (id == null) {
    id = 'noId';
  }

  return [
      `<img src="${htmlToText(imgSrc)}" class="item-icon">`,
      `${htmlToText(name)}`,
      `${htmlToText(desc)}`,
      `${htmlToText(wght)}`,
      `${htmlToText(prce)}`,
      `${id}`
    ];
}

// converts HTML code to text inserting it into div element
function htmlToText(str) {
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

// [API MANAGEMENT]
// fetch data from api
fetch(apiURL)
.then(res => res.json())
.then((data) => {
  if (!Array.isArray(data)) {
    table.row.add(addRowData(data.icon, data.name, data.desc, data.wght, data.prce, data.id));
  } else {
    for(const obj of data) {
      table.row.add(addRowData(obj.icon, obj.name, obj.desc, obj.wght, obj.prce, obj.id));
    }
  }
  table.draw();
});


// TODO: 
// rescale the image before storing it,
// delete confirmation,
// inputs validation (weight in kgs/lbs (for multiple(e.g. 5) items: 1kg (5kg)), price in pc/gc/sc/cc), 
// try-catch methods should display the error to the user, not the console,
// table data transfer to csv using python(and other way around), 
// uploading and downloading csv data to/from the database, 
// registration and log-in/out functions with personal inventories,
// styling
