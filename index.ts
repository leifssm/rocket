import {
  intro,
  outro,
  text,
  log,
  tasks,
  group,
  select,
  multiselect,
  confirm,
  cancel,
  isCancel,
  groupMultiselect,
  selectKey,
  note,
  password,
  spinner,
  updateSettings,
} from '@clack/prompts';
import { $, sleep } from 'bun';
import { github } from './github';
import { runMenu } from './lib/menu';
import { createRepo } from './tasks/createRepo';
import { uploadRepo } from './tasks/uploadRepo';
import { getFolders } from './lib/helpers/files';

intro(` ✶ Rocket 🚀 ✶`);
log.info((await getFolders('~/dev')).join(', '));

await runMenu({
  label: 'Select an option',
  options: [
    {
      label: 'Create repo',
      hint: 'Create a new repository',
      protocol: createRepo,
    },
    {
      label: 'Upload repo',
      hint: 'Uploads an existing repository',
      protocol: uploadRepo,
    },
  ],
});

// const p = await password({
//   message: 'Enter your password',
// })

// Do stuff
// const meaning = await text({
//   message: 'What is the meaning of life?',
//   placeholder: 'Not sure',
//   initialValue: '42',
//   validate(value) {
//     if (value.length === 0) return `Value is required!`;
//   },
// });

// const

outro(`Blastoff!`);
