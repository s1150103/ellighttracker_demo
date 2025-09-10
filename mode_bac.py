    elif mode == 'j':
       # mode = request.form.get('mode') or request.args.get('mode')
        sys_id = request.form.get('sysId') or request.form.get('sid') or request.args.get('sysId') or request.args.get('sid')
        date = request.form.get('date') or request.args.get('date')

        print("🔍 sys_id:", sys_id)
        print("🔍 date:", date)

        if not sys_id or not date:
            return Response(json.dumps({"error": "sysId または date が指定されていません"}), mimetype="application/json", status=400)

        query = datastore_client.query(kind='SensorData')
        query.add_filter('sysId', '=', sys_id)
        query.add_filter('date', '=', date)
        query.order = ['time']
        results = list(query.fetch())

        print("📦 results 件数:", len(results))

        data_lists = [
            {
                'data': entity.get('data1', ''),
                'Time': entity.get('time', '')
            }
            for entity in results
        ]

        response = {
            'Date': date,
            'data_lists': data_lists
        }

        print("[DEBUG] Response JSON:", response)  # Debug log for inspection

        return jsonify(response)
        response_data = {
            "Date": date,
            "data_lists": data_lists
        }
        print("[DEBUG] Response JSON:", response)  # Debug log for inspection
        return jsonify(response)
        return jsonify({'error': 'Invalid mode'}), 400
