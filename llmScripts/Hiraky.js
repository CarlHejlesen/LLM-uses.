async function postToLlamaModel(prompt) {
    const url = 'http://localhost:5010/v1/chat/completions';
    const data = {
        prompt: prompt,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error posting to LLaMA model:', error);
        return null;
    }
}

let current_Field = "Computer Science"
let primary_keyword = "Memory Hiraky"
let higest_layer = "Memory Hiraky"

let message = "Current field: [" + current_Field + "] Primary Keyword: [" + primary_keyword + "] Instruction: Expand on the given keyword by providing the next layer of related keywords or concepts. Ensure there are no information gaps. Only give keywords that are 'within/below' the primary keyword. Give no explanation at all. Only the keywords. Example: Current field: [Cars] Primary Keyword: [Toyota] keywords: Motor, Wells, Lights, seats, steering wheel"
let message2 = "Current field: [flower] Primary Keyword: [rose] Instruction: Expand on the given keyword by providing the next layer of related keywords or concepts. Ensure there are no information gaps. Only give keywords that are 'within/below' the primary keyword. Give no explanation at all. Only the keywords. Example: Current field: [Cars] Primary Keyword: [Toyota] keywords: Motor, Wells, Lights, seats, steering wheel"
let que = []
que.push(message)
que.push(message2)

let awnser = ""
async function awnsersss() {
    let awnsers = [];
    while (que.length > 0) {
        let message = que.shift();
        try {
            let response = await postToLlamaModel(message);
            if (response) {
                let awnser = response.choices[0].message.content;
                awnsers.push(awnser);
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    }
    return awnsers;
}

//awnsersss().then(awnsers => console.log(awnsers));

const csQuestions = [
    "What is a mutex and how does it ensure mutual exclusion?",
    "Can you explain what race conditions are and how they occur?",
    "What is a deadlock and how can it occur in a multi-threaded environment?",
    "What is synchronization in the context of concurrent programming?",
    "How do semaphores differ from mutexes in terms of synchronization?",
    "Can you explain what condition variables are and how they are used in synchronization?",
    "What are the different levels of abstraction in synchronization mechanisms?",
    "How can atomic operations help in achieving synchronization?",
    "What are monitors and how do they help in synchronizing access to shared resources?",
    "Can you explain the concept of futures and how they relate to synchronization?"
  ];
  

async function testPerformencename() {
    let awnsers = [];
    while (csQuestions.length > 0) {
        let message = csQuestions.shift();
        try {
            let response = await postToLlamaModel(message);
            if (response) {
                let awnser = response.choices[0].message.content;
                awnsers.push(awnser);
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    }
    return awnsers;
}


testPerformencename().then(awnsers => console.log(awnsers));

function GetKeywords(Message) {




    return
}



let synchronizationTerms = `
| Concept                                                                                                                            | Technical Term                    |
| ---------------------------------------------------------------------------------------------------------------------------------  | --------------------------------  |
| Abstraction layers in computer architecture and operating systems | Bits                              |
| Organization of hardware components (processor, memories, peripherals, buses,...)                                            | Bytes                             |
| Processor architectures (Harvard, von Neuman) and types (embedded, desktop, high-performance, server, micro-controllers, DSP) | Word size                         |
| Number and data representation | Register                      |
| Instruction set architectures | Signed && Unsigned          |
| Instruction level parallelism | Assembly Code                |
| Digital logical circuits and Boolean algebra | Code flags                   |
| The memory hierarchy | Assembly instructions         |
| Virtual memory | Compilers && Compiling        |
| The driving time environment of a running program | w-bits                        |
| Interruptions (interrupts), system calls, and exceptions | uMax                          |
| Cores and operating systems, virtual machines | TMax                          |
| Multi-programming: processes and threads, synchronisation, deadlocks | Tmin                          |
| Basic multi-core programming | Values of the two complement  |
| Synchronization | Truncation                    |
| Parallelism | Shift operations              |
| Concurrency | Bitwise operations            |
| CPU CORE | Thread                        |
| Cache memories | Uniprocessor                  |
| Multiprocessors | Bits to numbers               |
| Most significant bit (MSB) |

`;

