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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5387234977479952, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2984344422700587, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4675324675324675, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8908765652951699, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8858407079646018, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6901041666666666, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.47058823529411764, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.47643979057591623, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4981308411214953, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5120898100172712, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5911458333333334, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7750439367311072, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4965034965034965, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7428, 0, 0.0, 682.6094507269788, 0, 3419, 633.0, 1285.0, 1460.0, 2009.71, 6.184907759278194, 2081.0781618251494, 21.928777175281933], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 511, 0, 0.0, 1536.8277886497074, 1046, 3419, 1431.0, 2061.6, 2247.2, 2961.64, 0.4763156472020417, 186.4016696273273, 2.4706552989999238], "isController": false}, {"data": ["4.1 Vaccination questions", 539, 0, 0.0, 1161.205936920224, 504, 2495, 1120.0, 1382.0, 1581.0, 1982.8000000000002, 0.4819988195947275, 184.42764875789172, 2.393727371373831], "isController": false}, {"data": ["Get Next Patient from STS", 573, 0, 0.0, 0.6823734729493885, 0, 8, 1.0, 1.0, 1.0, 1.0, 0.4834439432826603, 0.20367277657971425, 0.3086351641347028], "isController": false}, {"data": ["2.0 Register attendance", 565, 0, 0.0, 2544.3646017699116, 1587, 5532, 2453.0, 3316.600000000001, 3680.299999999998, 4397.640000000003, 0.48420547452136503, 816.8247919697416, 7.758457895280926], "isController": true}, {"data": ["1.0 Login", 576, 0, 0.0, 3091.0434027777796, 1639, 5984, 3069.5, 3608.2000000000003, 3833.8999999999996, 4424.820000000004, 0.48296702743856423, 778.4799504356137, 7.970306207436435], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 134, 0, 0.0, 3436.649253731342, 1726, 5537, 3349.0, 4220.0, 4448.5, 5273.100000000004, 0.12166245387721897, 138.68378358513604, 1.7477805965182749], "isController": true}, {"data": ["2.5 Select patient", 559, 0, 0.0, 438.8318425760284, 306, 1649, 398.0, 603.0, 700.0, 1027.199999999998, 0.481772370742369, 189.8460337257358, 1.7124214520890737], "isController": false}, {"data": ["2.3 Search by first/last name", 565, 0, 0.0, 446.2318584070796, 304, 1865, 407.0, 587.0000000000002, 699.3999999999999, 1215.0400000000002, 0.4844055700639072, 191.10341446715816, 1.791220542890041], "isController": false}, {"data": ["4.0 Vaccination for flu", 138, 0, 0.0, 3374.03623188406, 1657, 5171, 3329.5, 3909.8, 4042.549999999999, 4876.159999999989, 0.12390305394092518, 142.15996622182777, 1.7910283246421628], "isController": true}, {"data": ["4.0 Vaccination for hpv", 130, 0, 0.0, 3484.930769230771, 1677, 5189, 3353.0, 4176.8, 4538.599999999999, 5171.639999999999, 0.11692634809333602, 133.48364072501982, 1.6870947209102987], "isController": true}, {"data": ["1.2 Sign-in page", 576, 0, 0.0, 640.7777777777774, 190, 1986, 534.5, 1111.0, 1190.4999999999998, 1528.23, 0.4834648312909182, 188.01263301709122, 2.035535268381736], "isController": false}, {"data": ["Debug Sampler", 565, 0, 0.0, 0.5274336283185844, 0, 3, 1.0, 1.0, 1.0, 1.0, 0.4832826955712487, 3.0010672581961324, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 136, 0, 0.0, 1030.3308823529414, 715, 2253, 952.5, 1347.3999999999999, 1631.750000000001, 2249.3, 0.1340046704568968, 52.9448638676359, 0.5869247529288889], "isController": false}, {"data": ["1.4 Open Sessions list", 573, 0, 0.0, 957.9528795811519, 517, 2209, 859.0, 1360.6, 1469.4999999999998, 1770.82, 0.48288985560497755, 215.8263005606958, 1.7139408202364559], "isController": false}, {"data": ["4.2 Vaccination batch", 535, 0, 0.0, 801.5177570093464, 508, 2007, 767.0, 1026.8000000000002, 1142.1999999999998, 1417.7599999999998, 0.4821844125551808, 185.76761360935083, 2.156675931911505], "isController": false}, {"data": ["1.1 Homepage", 579, 0, 0.0, 706.2746113989646, 489, 1711, 679.0, 873.0, 1025.0, 1392.0000000000011, 0.48310428294057817, 187.66287544227197, 2.015997425477618], "isController": false}, {"data": ["1.3 Sign-in", 576, 0, 0.0, 790.7013888888895, 404, 2217, 722.5, 1141.8000000000004, 1230.1999999999998, 1677.5800000000027, 0.4834392675223654, 188.50253421371457, 2.218640221622493], "isController": false}, {"data": ["2.2 Session register", 569, 0, 0.0, 530.5746924428825, 296, 2193, 483.0, 765.0, 881.5, 1340.3999999999992, 0.48324851713196676, 199.84009262643656, 1.7215537663340545], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 132, 0, 0.0, 3433.8787878787875, 1706, 5967, 3392.0, 4000.4, 4375.549999999999, 5550.869999999984, 0.12035416949696516, 137.2612225917883, 1.72817770766109], "isController": true}, {"data": ["2.1 Open session", 572, 0, 0.0, 887.9213286713292, 408, 2082, 827.0, 1290.7000000000005, 1466.5000000000002, 1856.2099999999996, 0.48418115824259167, 187.45366730987848, 1.7206531038805597], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7428, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
