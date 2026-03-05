const renderGrid = () => {
  // TODO: implement code to Render grid
  const tbody = document.querySelector("#document-table-body");

    const data = [
    {
      type: 'folder',
      name: 'CAS',
      modified: 'April 30',
      modifiedBy: 'Megan Bowen',
    },
    {
      type: 'excel',
      name: 'CoasterAndBargeLoading.xlsx',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
    },
    {
      type: 'excel',
      name: 'RevenueByServices.xlsx',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
    },
    {
      type: 'excel',
      name: 'RevenueByServices2016.xlsx',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
    },
    {
      type: 'excel',
      name: 'RevenueByServices2017.xlsx',
      modified: 'A few seconds ago',
      modifiedBy: 'Administrator MOD',
    },
  ];

  const html = data.map(item => {

    const icon =
      item.type === "folder"
        ? '<iconify-icon icon="fxemoji:folder" class="icon-folder"></iconify-icon>'
        : '<iconify-icon icon="uiw:file-excel" class="icon-excel"></iconify-icon>';

    const nameIcon =
      item.type === "excel"
        ? '<iconify-icon icon="fluent-mdl2:glimmer" class="name-icon"></iconify-icon>'
        : '';

    return `
      <tr>
        <td data-label="File Type">
          ${icon}
        </td>

        <td data-label="Name" class="td-name">
          <span class="name-value">
            ${nameIcon}
            ${item.name}
          </span>
        </td>

        <td data-label="Modified">
          ${item.modified}
        </td>

        <td data-label="Modified By">
          ${item.modifiedBy}
        </td>

        <td></td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = html;
};

export default renderGrid;
