// export const requests = [
//   {
//     label: 'Endorsement',
//     value: 72,
//     nestedLabels: ([
//          { value: 50, label: 'Category A' },
//     { value: 22, label: 'Category B' },
//     ]),
//   },
//   {
//     label: 'Endorsed',
//     value: 38,
//   },
//   {
//     label: 'Approval',
//     value: 83,
//   },
//   {
//     label: 'Approved',
//     value: 42,
//   },
// ];


// export const procurementRequest = [
//   ...requests.map((v) => ({
//     ...v,
//     label: v.label === 'Other' ? 'Other (Request)' : v.label,
//     value: v.value, 
//     nestedLabels: [
//     { 
//         label: `${v.nestedLabels.label} - Endorsement`, value: v.nestedLabels.value + 10 },
//     // { label: `${v.nestedLabels.label} - Detail 2`, value: v.nestedLabels.value - 10 }
//   ]
//   })),
// ];


// Data from the previous response
export const requests = [
  {
    label: 'Endorsement',
    value: 72,
    nestedLabels: [
      { value: 50, label: 'Category A' },
      { value: 22, label: 'Category B' },
    ],
  },
  {
    label: 'Endorsed',
    value: 38,
  },
  {
    label: 'Approval',
    value: 83,
  },
  {
    label: 'Approved',
    value: 42,
  },
];

const outerData = requests.map((item, index) => ({
  id: index,
  value: item.value,
  label: item.label,
}));

const innerNestedData = requests.find((item) => item.nestedLabels)?.nestedLabels || [];
const innerData = innerNestedData.map((item, index) => ({
  id: `nested-${index}`,
  value: item.value,
  label: item.label,
}));
