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

    var data = {"OkPercent": 99.96457669146298, "KoPercent": 0.035423308537017355};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.814727215389467, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [0.9705882352941176, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.9607843137254902, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [0.9705882352941176, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.7727272727272727, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.9747474747474747, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.95, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.42857142857142855, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.494949494949495, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.9901960784313726, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8627450980392157, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.23, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9693877551020408, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.5459183673469388, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9343434343434344, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.9795918367346939, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.5459183673469388, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.4411764705882353, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.9285714285714286, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.9030612244897959, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.3939393939393939, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.9444444444444444, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.9866666666666667, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9948979591836735, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9591836734693877, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.9897959183673469, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.9693877551020408, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.63, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9693877551020408, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.9948979591836735, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2823, 1, 0.035423308537017355, 386.7630180658872, 0, 4058, 255.0, 790.9999999999995, 1286.5999999999954, 2485.67999999999, 3.134079310080678, 86.66001116578202, 2.9449570122249074], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 51, 0, 0.0, 107.4313725490196, 90, 340, 99.0, 116.60000000000001, 176.99999999999986, 340.0, 0.07909650083283963, 0.05739130870976547, 0.06318450945435822], "isController": false}, {"data": ["1.4 Select Organisations-1", 51, 0, 0.0, 183.9411764705882, 99, 2620, 108.0, 125.80000000000001, 625.1999999999982, 2620.0, 0.07909613281946695, 1.0789206867405414, 0.05113441399071009], "isController": false}, {"data": ["2.0 Register attendance", 100, 0, 0.0, 3969.1800000000007, 2459, 8062, 3720.0, 5488.800000000001, 6247.399999999994, 8061.58, 0.15473432889400543, 49.03595858980548, 0.6655464989230491], "isController": true}, {"data": ["1.3 Sign-in-1", 51, 0, 0.0, 111.4901960784314, 94, 369, 101.0, 123.80000000000003, 164.99999999999991, 369.0, 0.0793141040694356, 0.7133622055463886, 0.05235970151458835], "isController": false}, {"data": ["1.3 Sign-in-0", 51, 0, 0.0, 392.90196078431376, 317, 898, 365.0, 476.6000000000002, 765.5999999999999, 898.0, 0.07927748674822402, 0.05628391881441296, 0.07238715831014597], "isController": false}, {"data": ["1.4 Select Organisations", 51, 0, 0.0, 291.5882352941177, 191, 2959, 209.0, 229.00000000000003, 808.1999999999985, 2959.0, 0.07908276398912069, 1.136119668988237, 0.114299307328026], "isController": false}, {"data": ["2.4 Patient attending session-1", 99, 0, 0.0, 576.7575757575754, 257, 3634, 464.0, 793.0, 1741.0, 3634.0, 0.1526023321952385, 18.491699297778787, 0.10193358908353821], "isController": false}, {"data": ["2.4 Patient attending session-0", 99, 0, 0.0, 250.8888888888889, 148, 1323, 217.0, 342.0, 502.0, 1323.0, 0.15267340383040606, 0.11346138702630763, 0.12494171133777372], "isController": false}, {"data": ["2.3 Search by first/last name", 100, 0, 0.0, 349.7999999999999, 215, 2670, 274.5, 481.30000000000007, 624.1499999999996, 2655.5599999999927, 0.15416111686645947, 5.4850118901578915, 0.1329609523380075], "isController": false}, {"data": ["1.2 Sign-in page", 51, 0, 0.0, 95.31372549019606, 87, 220, 92.0, 97.0, 120.99999999999991, 220.0, 0.07935680531286032, 0.47823324764224706, 0.047815575076205874], "isController": false}, {"data": ["3.0 Nurse triage", 98, 0, 0.0, 1253.826530612245, 708, 4013, 1115.5, 1649.0000000000025, 2525.449999999999, 4013.0, 0.15392782983749617, 17.461800214929585, 0.45873873960987144], "isController": true}, {"data": ["4.2 Vaccination batch-2", 98, 0, 0.0, 0.36734693877551017, 0, 4, 0.0, 1.0, 1.0, 4.0, 0.15340424366229152, 0.7321448050944297, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 99, 0, 0.0, 827.8585858585858, 412, 3790, 686.0, 1314.0, 2015.0, 3790.0, 0.15256399982740232, 18.600434426952663, 0.22676016380596326], "isController": false}, {"data": ["4.2 Vaccination batch-0", 98, 0, 0.0, 167.09183673469394, 100, 420, 119.5, 284.20000000000005, 296.15, 420.0, 0.1533679924129793, 0.11472644744955289, 0.1377915556835361], "isController": false}, {"data": ["4.2 Vaccination batch-1", 98, 0, 0.0, 144.95918367346928, 115, 379, 134.0, 185.9000000000001, 231.49999999999997, 379.0, 0.15337327298564551, 2.086449339282025, 0.10640545916906116], "isController": false}, {"data": ["1.1 Homepage", 51, 0, 0.0, 291.5098039215685, 257, 557, 269.0, 369.40000000000003, 415.4, 557.0, 0.07936310331519912, 0.40960351662190175, 0.043014181972593275], "isController": false}, {"data": ["1.3 Sign-in", 51, 0, 0.0, 504.5686274509804, 415, 1111, 470.0, 579.8000000000001, 938.3999999999999, 1111.0, 0.07926307102437417, 0.7691768913761778, 0.12470000724635429], "isController": false}, {"data": ["2.1 Open session", 100, 0, 0.0, 1722.4399999999998, 1007, 4058, 1525.0, 2747.500000000001, 3329.899999999999, 4053.1299999999974, 0.15431360536764444, 2.647549786873622, 0.09764705749030525], "isController": false}, {"data": ["3.3 Nurse triage complete", 98, 0, 0.0, 231.25510204081633, 144, 1296, 194.0, 390.60000000000014, 510.4499999999998, 1296.0, 0.15399483017355847, 3.574731135142249, 0.10406681882822505], "isController": false}, {"data": ["4.3 Vaccination confirm", 98, 0, 0.0, 740.5102040816328, 440, 2366, 694.0, 990.5000000000003, 1212.1999999999994, 2366.0, 0.1509417688218995, 3.662427121020644, 0.35105633246926876], "isController": false}, {"data": ["4.1 Vaccination questions", 99, 1, 1.0101010101010102, 383.787878787879, 225, 1717, 283.0, 475.0, 1037.0, 1717.0, 0.14409284819163476, 1.6659697971747613, 0.2895146777305231], "isController": false}, {"data": ["3.1 Nurse triage new", 98, 0, 0.0, 182.83673469387756, 111, 2108, 133.0, 288.1, 425.2499999999999, 2108.0, 0.1538002793515278, 1.7319175550071406, 0.10573769205417535], "isController": false}, {"data": ["3.2 Nurse triage result", 98, 0, 0.0, 839.7346938775512, 399, 3589, 774.0, 1000.5, 1396.4499999999978, 3589.0, 0.1533711127074227, 12.111308033555408, 0.24799163804652155], "isController": false}, {"data": ["1.0 Login", 51, 0, 0.0, 1312.039215686275, 1088, 4360, 1195.0, 1506.0, 2033.7999999999993, 4360.0, 0.07925087719843488, 3.6597807431245983, 0.3772929944749707], "isController": true}, {"data": ["3.2 Nurse triage result-1", 98, 0, 0.0, 423.7653061224491, 191, 3251, 358.5, 561.0000000000001, 625.9499999999999, 3251.0, 0.15345853252929414, 12.004466201149686, 0.10541557656954412], "isController": false}, {"data": ["3.2 Nurse triage result-0", 98, 0, 0.0, 415.7653061224489, 163, 3008, 354.5, 586.0000000000002, 659.35, 3008.0, 0.15345396694163113, 0.1137417586999004, 0.14271316791622038], "isController": false}, {"data": ["4.0 Vaccination", 99, 1, 1.0101010101010102, 1426.727272727273, 262, 3041, 1303.0, 1860.0, 2676.0, 3041.0, 0.14362021592356503, 7.828994734197424, 0.8455821551156361], "isController": true}, {"data": ["2.5 Patient return to consent page", 99, 0, 0.0, 302.61616161616166, 143, 2721, 210.0, 517.0, 622.0, 2721.0, 0.15345601547580665, 3.4674601920176524, 0.10640016698029563], "isController": false}, {"data": ["1.5 Open Sessions list", 150, 0, 0.0, 166.12000000000012, 105, 2150, 127.5, 269.9, 282.84999999999985, 1841.4500000000055, 0.17685425794311424, 1.931580098472451, 0.11173942168362896], "isController": false}, {"data": ["4.2 Vaccination batch", 98, 0, 0.0, 313.03061224489807, 218, 544, 270.0, 426.3, 453.69999999999993, 544.0, 0.15333943561699562, 2.932529609277818, 0.24414788307476862], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 98, 0, 0.0, 331.561224489796, 175, 1141, 328.5, 481.3, 623.6999999999998, 1141.0, 0.15103202649533265, 0.11386398872499687, 0.14477715263019192], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 98, 0, 0.0, 140.82653061224485, 97, 1684, 115.5, 158.20000000000002, 237.19999999999976, 1684.0, 0.15110584810470093, 0.11288669316415646, 0.10196693460971518], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 98, 0, 0.0, 267.8265306122448, 141, 884, 232.5, 409.4000000000003, 541.5499999999996, 884.0, 0.1510713735162633, 3.4388172378410666, 0.10459922248342839], "isController": false}, {"data": ["2.2 Session register", 100, 0, 0.0, 776.5, 347, 3898, 594.0, 1555.800000000001, 2074.2999999999984, 3883.9799999999927, 0.15444086999630888, 18.685609317977537, 0.09908497886862797], "isController": false}, {"data": ["4.1 Vaccination questions-0", 98, 0, 0.0, 237.13265306122454, 113, 1587, 152.0, 339.0, 471.9499999999986, 1587.0, 0.15350155851072161, 0.11452655342010871, 0.20337059759879705], "isController": false}, {"data": ["4.1 Vaccination questions-1", 98, 0, 0.0, 147.77551020408157, 107, 1432, 128.0, 170.3, 198.04999999999995, 1432.0, 0.15350829101412589, 1.6713851538685656, 0.10619930946723224], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 100.0, 0.035423308537017355], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2823, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 99, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
