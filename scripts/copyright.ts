/* Copyright (c) 2020 - 2021, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import fs = require('fs');
import globby = require('globby');

const currentYear = new Date().getFullYear();

const COPYRIGHT_NOTICE = `/* Copyright (c) 2020 - ${currentYear}, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

`;

const insert = Buffer.from(COPYRIGHT_NOTICE);

function addCopyrightNotice(filePath: string) {
    // Script modified from: https://stackoverflow.com/a/49889780/2480017
    const contents = fs.readFileSync(filePath);

    if (contents.slice(0, 16).equals(insert.slice(0, 16))) {
        console.info(`Skipping ${filePath}`);
        return;
    }

    const fileDescriptor = fs.openSync(filePath, 'w+');
    fs.writeSync(fileDescriptor, insert, 0, insert.length, 0);
    fs.writeSync(fileDescriptor, contents, 0, contents.length, insert.length);
    console.info(`Adding copyright notice to ${filePath}`);
    fs.close(fileDescriptor, (err) => {
        if (err) throw err;
    });
}

function checkCopyrightNotice(filePath: string) {
    // Script modified from: https://stackoverflow.com/a/49889780/2480017
    const contents = fs.readFileSync(filePath);

    // Return true if the copyright notice doesn't match so it is listed as a failure
    return !contents.slice(0, 16).equals(insert.slice(0, 16));
}

function main(args: string[]) {
    const mode = args[0];
    const allowedModes = ['apply', 'check'];
    if (!allowedModes.includes(mode)) {
        console.error(`Usage: npm run copyright <mode>

Where mode is: apply, check
`);
        return Promise.resolve(1);
    }

    const checkMode = mode === 'check';

    return globby(['scripts/**/*.js', 'src/**/*.(ts|tsx|js|css)', 'test/**/*.ts']).then((files) => {
        if (checkMode) {
            const failed = files.filter(checkCopyrightNotice);

            if (failed.length !== 0) {
                console.error(`No copyright notice detected for: ${failed.join(', ')}\n`);
                return 1;
            }

            console.info('Finished checking copyright notices.');
            return 0;
        } else {
            files.forEach(addCopyrightNotice);
            console.info('Finished adding copyright notices.');
            return 0;
        }
    });
}

main(process.argv.slice(2)).then((status) => process.exit(status));
