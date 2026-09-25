require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function obterContatosPendentes(caminhoContatos, caminhoRespondentes) {
    const todosContatos = JSON.parse(fs.readFileSync(caminhoContatos, 'utf8'));
    
    let respondentes = [];
    if (fs.existsSync(caminhoRespondentes)) {
        respondentes = JSON.parse(fs.readFileSync(caminhoRespondentes, 'utf8'));
    }

    return todosContatos.filter(contato => !respondentes.includes(contato.email));
}

async function dispararCampanha() {
    console.log('Iniciando disparos em HTML: Museu da Memória...');

    const contatos = obterContatosPendentes('./contatos.json', './respondentes.json');
    console.log(`Total de e-mails na fila: ${contatos.length}`);

    for (const [index, contato] of contatos.entries()) {
        try {
            let assunto = '';
            let corpoHtml = '';
            const linkForms = 'https://docs.google.com/forms/d/e/1FAIpQLSfBhQQf-KeQ7LC-K2z4qBTRJ3TDJ4xeeHmqh00ZJeThmixoIQ/viewform?usp=dialog';

            // Estrutura HTML comum para manter a responsividade e padrão visual
            const baseEstilo = `font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 8px; background-color: #ffffff;`;
            const rodape = `<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px 0;" /><p style="font-size: 12px; color: #888; text-align: center; margin: 0;"><strong>Equipe Museu da Memória</strong><br>Estágio Interno – Fatec Zona Leste</p>`;

            if (contato.tipo === 'institucional') {
                assunto = 'Convite Oficial: Ajude a construir o Museu da Memória da Fatec ZL';
                corpoHtml = `
                    <div style="background-color: #f9f9f9; padding: 20px;">
                        <div style="${baseEstilo}">
                            <h2 style="color: #b30000; text-align: center; margin-top: 0;">Museu da Memória</h2>
                            <p style="font-size: 16px;">Prezado(a) <strong>${contato.nome}</strong>,</p>
                            <p style="font-size: 16px;">A história da nossa instituição é construída diariamente por profissionais como você. A equipe do estágio interno convida você a fazer parte da estruturação do <strong>Museu da Memória – Fatec Zona Leste</strong>.</p>
                            <p style="font-size: 16px;">Nosso objetivo é criar um acervo digital que preserve a trajetória, os projetos e os momentos marcantes da nossa faculdade. Sua contribuição é fundamental.</p>
                            
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${linkForms}" style="background-color: #b30000; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Acessar Formulário Oficial</a>
                            </div>
                            
                            <p style="font-size: 16px;">Contamos com você para eternizar o legado da Fatec ZL.</p>
                            ${rodape}
                        </div>
                    </div>
                `;
            } else if (contato.tipo === 'aluno') {
                assunto = 'Deixe sua marca na história da Fatec ZL! 📸';
                corpoHtml = `
                    <div style="background-color: #f9f9f9; padding: 20px;">
                        <div style="${baseEstilo}">
                            <h2 style="color: #0056b3; text-align: center; margin-top: 0;">Museu da Memória</h2>
                            <p style="font-size: 16px;">Fala, <strong>${contato.nome}</strong>, tudo beleza?</p>
                            <p style="font-size: 16px;">Você já parou para pensar em quanta história acontece nos corredores da faculdade? Nós, da equipe de estágio interno, estamos criando o <strong>Museu da Memória</strong> e queremos que VOCÊ faça parte disso.</p>
                            <p style="font-size: 16px;">Tem alguma foto legal com a turma, registros de projetos ou eventos? Manda pra gente e garanta seu espaço no nosso acervo oficial:</p>
                            
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${linkForms}" style="background-color: #0056b3; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">🚀 Quero enviar meus materiais</a>
                            </div>
                            
                            <p style="font-size: 16px;">Vamos juntos eternizar a vivência da nossa comunidade!</p>
                            ${rodape}
                        </div>
                    </div>
                `;
            }

           const mailOptions = {
            from: `"Museu da Memória - Fatec ZL" <${process.env.EMAIL_USER}>`,
             replyTo: process.env.EMAIL_USER, 
             to: contato.email,
             subject: assunto,
             html: corpoHtml 
};
            await transporter.sendMail(mailOptions);
            console.log(`[${index + 1}/${contatos.length}] E-mail HTML enviado -> ${contato.email}`);

            const delay = Math.floor(Math.random() * (15000 - 10000 + 1) + 10000);
            await sleep(delay);

        } catch (error) {
            console.error(`Erro ao enviar para ${contato.email}:`, error.message);
        }
    }

    console.log('Rotina de disparos finalizada com sucesso!');
}

dispararCampanha();