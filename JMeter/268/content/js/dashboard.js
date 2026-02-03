/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.92177951601076, "KoPercent": 0.07822048398924468};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.698092297949814, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3766859344894027, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9042956411876184, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.16770186335403728, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.27001231527093594, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.24285714285714285, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9466957605985037, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9511742892459827, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.27146464646464646, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.2573170731707317, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9234317343173432, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4264705882352941, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.5446979038224414, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9029803424223208, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9290104486785494, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.915948275862069, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9252625077208153, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.25129533678756477, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6357186921653301, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20455, 16, 0.07822048398924468, 461.32016621853035, 0, 8525, 178.0, 1186.9000000000015, 1693.0, 3055.9100000000144, 5.468292192599373, 2141.1657977842824, 41.30245298008892], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1557, 0, 0.0, 1278.3230571612112, 543, 8525, 915.0, 2355.0, 3157.0, 5634.3600000000115, 0.450175125930492, 188.56523923622095, 4.606320535477819], "isController": false}, {"data": ["4.1 Vaccination questions", 1583, 0, 0.0, 323.44851547694253, 84, 4072, 150.0, 781.0, 1245.1999999999996, 2297.32, 0.45169167520543696, 185.1250600482601, 4.206119300905837], "isController": false}, {"data": ["2.0 Register attendance", 1610, 16, 0.9937888198757764, 2260.0962732919234, 428, 9239, 1876.0, 4004.6000000000004, 5006.9, 7244.459999999998, 0.45057071357527584, 905.6450449198537, 15.83209078751505], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 39.0, 39, 39, 39.0, 39.0, 39.0, 39.0, 25.64102564102564, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1624, 0, 0.0, 1708.6083743842357, 385, 7544, 1415.5, 3002.0, 3728.25, 5093.25, 0.4522716905213991, 781.900110095016, 14.795162482660364], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 385, 0, 0.0, 1978.4051948051942, 634, 8473, 1527.0, 3655.800000000002, 4283.5999999999985, 7250.819999999999, 0.1108396579113893, 136.9277071025513, 3.1253162349006156], "isController": true}, {"data": ["2.5 Select patient", 1604, 0, 0.0, 214.85411471321683, 66, 2955, 105.0, 451.5, 805.75, 1939.900000000002, 0.45183569518893574, 190.303807281759, 3.23429454801712], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["2.3 Search by first/last name", 1618, 0, 0.0, 208.5896168108775, 75, 3044, 108.0, 406.8000000000011, 730.3499999999997, 1559.2999999999984, 0.4529013397258295, 192.70563323551613, 3.3625517320992007], "isController": false}, {"data": ["4.0 Vaccination for flu", 396, 0, 0.0, 1885.9343434343432, 254, 8441, 1393.0, 3469.9, 4613.15, 6466.639999999959, 0.11327768995896258, 139.90843502938068, 3.193951268138018], "isController": true}, {"data": ["4.0 Vaccination for hpv", 410, 0, 0.0, 1818.7658536585375, 227, 9139, 1489.5, 3163.400000000002, 3884.049999999998, 6751.759999999991, 0.11804091240443004, 145.69675555915117, 3.334520538956812], "isController": true}, {"data": ["1.2 Sign-in page", 1626, 0, 0.0, 266.9809348093483, 14, 3978, 126.5, 634.7999999999997, 1017.6499999999999, 2070.450000000003, 0.4523989245926671, 188.75885264278807, 3.8060533696659844], "isController": false}, {"data": ["Debug Sampler", 1617, 0, 0.0, 0.29870129870129886, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.4526737565958934, 2.6216141238271287, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1156, 16, 1.3840830449826989, 1031.67820069204, 179, 6585, 716.5, 2029.6999999999996, 2630.1499999999996, 4404.200000000009, 0.3248675729048079, 138.5369777735323, 2.8241537854870753], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 26.0, 26, 26, 26.0, 26.0, 26.0, 26.0, 38.46153846153847, 12.056790865384617, 22.686298076923077], "isController": false}, {"data": ["1.4 Open Sessions list", 1622, 0, 0.0, 871.3902589395815, 403, 4004, 673.0, 1507.7, 1807.85, 3181.4099999999994, 0.452139803188171, 216.0298882472328, 3.236049587185488], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1577, 0, 0.0, 314.61382371591606, 80, 5229, 140.0, 769.4000000000001, 1241.2999999999997, 2123.220000000001, 0.4512244147602173, 186.19005773041917, 3.9715017947401026], "isController": false}, {"data": ["1.1 Homepage", 1627, 0, 0.0, 272.17393976644126, 27, 4607, 131.0, 604.2000000000003, 980.9999999999991, 2277.480000000003, 0.4521759334014608, 188.518042068568, 3.7958793687643424], "isController": false}, {"data": ["1.3 Sign-in", 1624, 0, 0.0, 298.8220443349746, 73, 3999, 134.0, 671.0, 1192.75, 2176.25, 0.45226980121572574, 188.80797607053432, 3.9607834290635426], "isController": false}, {"data": ["2.2 Session register", 1619, 0, 0.0, 262.10129709697316, 73, 3940, 115.0, 603.0, 965.0, 1823.1999999999987, 0.4525666033241143, 196.18679403741754, 3.246920567642634], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 386, 0, 0.0, 1921.857512953368, 338, 8353, 1497.5, 3573.300000000001, 4332.6, 6907.109999999999, 0.11176565117245353, 138.5391484822782, 3.154172841435378], "isController": true}, {"data": ["2.1 Open session", 1621, 0, 0.0, 840.525601480569, 131, 5671, 593.0, 1832.3999999999999, 2312.399999999998, 4017.9199999999873, 0.4525787636419273, 189.79534450167756, 3.2430348964122313], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, 100.0, 0.07822048398924468], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20455, 16, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1156, 16, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
