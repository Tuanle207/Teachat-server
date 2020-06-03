var socket = io();
socket.on('private chat', function(data) {
    if (data) {
        try {
            console.log(data);
            console.log(document.querySelector('.card-body.msg_card_body'));
            const markup = `
                    <div class="d-flex justify-content-end mb-4">
                        <div class="img_cont_msg">
                            <img
                                src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
                                class="rounded-circle user_img_msg"
                            />
                        </div>
                        <div class="msg_cotainer">
                            ${'You dont need to worry about this'}
                            <span class="msg_time">8:40 AM, Today</span>
                        </div>
                    </div>
                `;
            document
                .querySelector('.card-body.msg_card_body')
                .insertAdjacentHTML('beforeend', markup);
        } catch (e) {
            console.log(e);
        }
    }
});

// document.querySelector('.buttonSend').addEventListener('click', () => {
//     const message = document.getElementById('message').value;
//     if (!message) {
//         return;
//     }
//     socket.emit('private chat', {
//         userId: '0whrhqqyw0rywq0',
//         name: 'Tran Thi Thanh Suong',
//         message,
//         sentAt: new Date().toLocaleString()
//     });
// });
