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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.37523144851160806, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.6608996539792388, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6387434554973822, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.4276094276094276, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.635593220338983, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.003787878787878788, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.6875, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.1482758620689655, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.5, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.95, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4357142857142857, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.15136054421768708, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4375, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.48121546961325967, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.5, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.002717391304347826, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.6363636363636364, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.6846689895470384, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.4375, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.4375, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.65, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.4817073170731707, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.39, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5745, 0, 0.0, 1134.0203655352493, 0, 9788, 838.0, 2168.0, 2949.5999999999985, 5008.62, 3.190344446135102, 95.88408136214797, 4.297321104177102], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 1, 0, 0.0, 7049.0, 7049, 7049, 7049.0, 7049.0, 7049.0, 7049.0, 0.14186409419775856, 32.25731819229678, 2.2748129167257765], "isController": true}, {"data": ["2.0 Register attendance", 293, 0, 0.0, 8359.136518771329, 4540, 17354, 7776.0, 11095.000000000004, 12410.7, 15861.900000000003, 0.17146094084656058, 57.96076429262999, 0.7257870443045122], "isController": true}, {"data": ["2.5 Select patient", 289, 0, 0.0, 684.525951557094, 434, 4437, 549.0, 974.0, 1110.5, 3262.7000000000235, 0.1711405004290356, 4.012624100920191, 0.11866187041466336], "isController": false}, {"data": ["2.5 Select menacwy", 191, 0, 0.0, 678.8848167539267, 445, 3472, 549.0, 953.6000000000001, 1170.399999999997, 2234.5999999999785, 0.12890998843184712, 3.3350371232082523, 0.08988450365267464], "isController": false}, {"data": ["2.3 Search by first/last name", 297, 0, 0.0, 1184.4040404040402, 685, 6135, 1010.0, 1609.7999999999997, 2205.2999999999997, 4604.799999999972, 0.1724504335647769, 16.024087618537898, 0.13461462880479658], "isController": false}, {"data": ["2.5 Select td_ipv", 177, 0, 0.0, 683.5423728813555, 449, 2902, 549.0, 933.4000000000001, 1280.5999999999983, 2372.379999999999, 0.12890905793697438, 3.3756260134746383, 0.08975796709869409], "isController": false}, {"data": ["4.0 Vaccination for flu", 282, 0, 0.0, 3356.86524822695, 1641, 9695, 3088.5, 4281.0, 4984.699999999999, 6959.59000000001, 0.17372426632299653, 8.50616136866692, 1.0409318262393872], "isController": true}, {"data": ["4.0 Vaccination for hpv", 264, 0, 0.0, 3558.5833333333326, 1180, 10889, 3149.0, 5308.5, 6296.5, 9087.350000000037, 0.17497024180357204, 8.189485740339522, 1.0520757615762035], "isController": true}, {"data": ["5.8 Consent confirm", 8, 0, 0.0, 2036.6249999999998, 1692, 2399, 2033.0, 2399.0, 2399.0, 2399.0, 0.006208683153824782, 0.6274438201484186, 0.013611052338810943], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 121.5142857142857, 112, 143, 120.0, 127.0, 133.15000000000003, 143.0, 0.23718281034523653, 1.4242549812625582, 0.14291190818653413], "isController": false}, {"data": ["Get correct patient name", 296, 0, 0.0, 0.7027027027027023, 0, 93, 0.0, 1.0, 1.0, 2.0299999999999727, 0.17285731387909914, 0.0, 0.0], "isController": false}, {"data": ["5.9 Patient home page", 8, 0, 0.0, 673.6249999999999, 462, 1171, 548.0, 1171.0, 1171.0, 1171.0, 0.006224523220972908, 0.16475990798209517, 0.004643318042403008], "isController": false}, {"data": ["2.4 Patient attending session", 290, 0, 0.0, 1917.5448275862075, 1236, 8309, 1655.0, 2556.6000000000004, 3421.9499999999994, 6548.45999999999, 0.16986341809713143, 15.991368668633958, 0.2524727757264004], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 151.0, 151, 151, 151.0, 151.0, 151.0, 151.0, 6.622516556291391, 31.73504759933775, 4.837541390728477], "isController": false}, {"data": ["5.4 Consent route", 8, 0, 0.0, 756.5, 563, 1075, 666.0, 1075.0, 1075.0, 1075.0, 0.006234550005766959, 0.07734053652783883, 0.009819872891163461], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 450.3285714285714, 338, 2634, 355.0, 477.79999999999995, 1044.1500000000015, 2634.0, 0.23646252069047055, 1.3234049864034052, 0.12816083885079216], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 1194.442857142857, 860, 3077, 1016.0, 1716.8, 2116.4, 3077.0, 0.23770472319284983, 3.668173863177161, 0.5257824199529345], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 171, 0, 0.0, 3539.9590643274864, 1637, 8439, 3155.0, 4745.600000000003, 6163.600000000001, 8352.6, 0.12966824644549763, 6.658701125592417, 0.7801606931279621], "isController": true}, {"data": ["2.1 Open session", 301, 0, 0.0, 3266.7940199335562, 1832, 9788, 2964.0, 4718.8, 5895.299999999999, 8593.22000000002, 0.1729882074915963, 3.1051569577035214, 0.11194810529780697], "isController": false}, {"data": ["4.3 Vaccination confirm", 882, 0, 0.0, 1895.978458049888, 1170, 9192, 1660.0, 2541.500000000001, 3501.699999999996, 5904.239999999985, 0.5538284174258784, 12.02368161011798, 1.2889764548749145], "isController": false}, {"data": ["5.6 Consent questions", 8, 0, 0.0, 866.75, 578, 1638, 711.5, 1638.0, 1638.0, 1638.0, 0.006231291520847954, 0.0787468816767315, 0.015474018970777579], "isController": false}, {"data": ["4.1 Vaccination questions", 905, 0, 0.0, 846.9657458563528, 551, 5183, 787.0, 1078.4, 1347.4999999999995, 3618.799999999975, 0.5501797355124909, 6.879352494495163, 1.1600461831812792], "isController": false}, {"data": ["5.3 Consent parent details", 8, 0, 0.0, 725.5, 557, 1206, 644.0, 1206.0, 1206.0, 1206.0, 0.0062363190750291545, 0.07306816131096781, 0.011404577156129365], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 8, 0, 0.0, 723.625, 573, 994, 671.5, 994.0, 994.0, 994.0, 0.006255116489816279, 0.09626175302180769, 0.009858375122072507], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2369.942857142858, 1860, 4805, 2108.0, 3627.1, 4034.6, 4805.0, 0.23500105750475878, 10.282902718374734, 0.929218048668719], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 184, 0, 0.0, 3538.836956521737, 1255, 9773, 3172.5, 4962.0, 6763.5, 8471.650000000009, 0.1283589586181879, 6.4404946790328435, 0.7698076752030025], "isController": true}, {"data": ["5.0 Consent for td_ipv", 1, 0, 0.0, 9961.0, 9961, 9961, 9961.0, 9961.0, 9961.0, 9961.0, 0.10039152695512499, 22.861425183214536, 1.6094997050998896], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 275, 0, 0.0, 713.6909090909097, 445, 5845, 625.0, 962.0, 1098.0, 2232.9200000000083, 0.17454344195859323, 4.288507575820084, 0.13005531856875646], "isController": false}, {"data": ["2.5 Select flu", 287, 0, 0.0, 654.2682926829266, 435, 4900, 531.0, 868.8, 988.3999999999994, 3246.800000000001, 0.1709524912900599, 4.133399818787381, 0.11853151251556888], "isController": false}, {"data": ["5.1 Consent start", 8, 0, 0.0, 1128.75, 692, 3143, 887.5, 3143.0, 3143.0, 3143.0, 0.006243907312317902, 0.08105722789832422, 0.013400925093404951], "isController": false}, {"data": ["5.5 Consent agree", 8, 0, 0.0, 939.375, 579, 2349, 748.5, 2349.0, 2349.0, 2349.0, 0.006235410114614632, 0.10704704251575416, 0.009705531539483787], "isController": false}, {"data": ["1.5 Open Sessions list", 70, 0, 0.0, 603.657142857143, 467, 2295, 514.5, 719.4, 1002.6000000000009, 2295.0, 0.23871964423952446, 3.992259675392438, 0.1426722873775283], "isController": false}, {"data": ["4.2 Vaccination batch", 902, 0, 0.0, 784.6263858093138, 537, 5136, 641.0, 1008.4000000000001, 1303.5999999999985, 3284.5300000000043, 0.5511641662633758, 8.419696078905384, 0.8912749341444367], "isController": false}, {"data": ["5.0 Consent for hpv", 3, 0, 0.0, 8665.333333333334, 8340, 9130, 8526.0, 9130.0, 9130.0, 9130.0, 0.0027506658903676266, 0.6177716225261198, 0.043326569369501536], "isController": true}, {"data": ["5.7 Consent triage", 8, 0, 0.0, 962.125, 687, 1294, 985.5, 1294.0, 1294.0, 1294.0, 0.006224653987046495, 0.10454333725681055, 0.010391646475445297], "isController": false}, {"data": ["5.0 Consent for flu", 3, 0, 0.0, 9165.666666666666, 7242, 10227, 10028.0, 10227.0, 10227.0, 10227.0, 0.002352599818849814, 0.5364685749028573, 0.03675324560750009], "isController": true}, {"data": ["2.2 Session register", 300, 0, 0.0, 1360.0533333333326, 706, 6045, 1218.5, 1873.1000000000013, 2419.9999999999986, 4725.86000000001, 0.17354824004729766, 19.19956891973018, 0.113828889606543], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5745, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
