const connection = require ('../database/connection');

module.exports = {
    async index (request, response) {
        const {page = 1} = request.query;

        const [count] = await connection('incidents').count(); //contador de registros cadastrados
        console.log(count);

        const incidents = await connection('incidents')
            .join ('ongs', 'ongs.id', '=', 'incidents.ong_id') //junção de dados para exibição de infos da ONG
            .limit(5) //limite da paginação
            .offset((page-1)*5)
            .select([
                'incidents.*', 
                'ongs.name',
                'ongs.email',
                'ongs.whatsapp',
                'ongs.city',
                'ongs.uf'
            ]); //todos os dados da tabela incidents, alguns dados da tabela ONG

        response.header('X-Total-Count', count['count(*)']); //retorno da contagem no header
        
        return response.json(incidents);
    },

    async create(request,response){
        const {title, description, value} = request.body;
        const ong_id = request.headers.authorization;

        const [id] = await connection ('incidents').insert({
            title,
            description,
            value,
            ong_id
        });

        return response.json({id});
    },

    async delete(request, response){
        const {id} = request.params;
        const ong_id = request.headers.authorization;

        const incident = await connection('incidents')
            .where('id', id)
            .select('ong_id')
            .first();

        if (incident.ong_id != ong_id){
            return response.status(401).json({error: 'Operation Not Permited'}); //não autorizado
        }

        await connection('incidents').where('id', id).delete();

        return response.status(204).send();
    }

}